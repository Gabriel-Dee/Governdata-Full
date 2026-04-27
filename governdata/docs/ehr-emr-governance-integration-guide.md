# EHR/EMR integration guide: governance platform

This guide explains how to connect a Spring Boot–style EMR backend (JWT RBAC, local `audit_event`, optional `GovernanceClient`) to the Governance Platform so that:

1. **Policy enforcement** runs at the right gate (after RBAC, before PHI touches your service/repository layer).
2. **HIPAA- and GDPR-oriented controls** are expressed through **request context** and **policy content** on the platform—not as separate magic switches.
3. **Operational controls** (MFA, training, Safe Harbor masking, retention policies) can be **tracked** via the **compliance catalog** and `POST /api/v1/compliance/evaluate` using evidence your stack or GRC tools assert.
4. **Immutable governance audit evidence** is produced via `POST /api/v1/audit/ingest` and verified with `GET /api/v1/audit/verify/{correlationId}`, alongside your **local** append-only audit table.

It aligns with the mental model: **two gates + local ledger + governance ledger**.

---

## 1. Mental model: two gates, two ledgers

| Layer | Your EMR | Governance platform |
|--------|----------|---------------------|
| **Gate A — RBAC** | JWT + `@PreAuthorize` / `SCOPE_*` — *may this user call this capability at all?* | Not involved |
| **Gate B — Policy** | Before read/write/export of sensitive data, call **`POST /api/v1/authorize`** — *is this specific access allowed for this patient/resource/action under purpose + compliance context?* | Evaluates JSON (or OPA) policy; returns `ALLOW` / `DENY` + trace |
| **Local ledger** | `audit_event` (who, what, when, resource, optional state hashes) | Optional: retrieve by `requestId` via `GET /api/v1/audit/{requestId}` for authorize-linked audit |
| **Governance ledger** | You **push** normalized events | `POST /api/v1/audit/ingest` → `eventHash`, optional blockchain `evidenceId`; `GET /api/v1/audit/verify/{correlationId}` |

**Enforcement is in your code:** if authorize returns `DENY`, you **do not** query patient/encounter tables and **do not** return PHI—return `403` or a clinical denial workflow.

---

## 2. What “both policies” (HIPAA + GDPR) means here

There is no single HHS “HIPAA JSON” or EU “GDPR JSON” that the platform downloads from regulators. In this architecture you combine:

### A. Request-time policy (Gate B) — `POST /api/v1/authorize`

- **HIPAA-oriented inputs** (examples): `context.purpose` (e.g. treatment, research), `context.attributes.emergencyAccess`, `context.attributes.legalBasis` (e.g. HIPAA treatment use), department/source system, resource type aligned to clinical objects (`PatientRecord`, `patient`, etc.—**must match your policy JSON**).
- **GDPR-oriented inputs** (examples): `context.attributes.legalBasis` (e.g. `GDPR_CONSENT`), `consentGranted`, `region`, `tenantId`, data-residency or processing-purpose fields you add under `attributes`.

The **active policy** in the platform (e.g. `default` vs `healthcare-compliance`) defines which combinations yield `ALLOW` vs `DENY`. Configure `governance.default-policy` and `governance.policy-scope` on the governance service.

### B. Compliance checklist (organizational / technical attestation) — `POST /api/v1/compliance/evaluate`

- Seeded **catalogs** per framework: **HIPAA** (e.g. §164.312 technical specs, Safe Harbor identifiers, selected privacy/admin rows) and **GDPR** (articles mapped to reference + evidence keys).
- Your EMR or a separate scanner/GRC integration submits a map of **boolean evidence** (e.g. `hipaa_audit_controls: true`, `phi_safe_harbor_names: true`). The service returns `PASS` / `FAIL` / `UNKNOWN` / `INFORMATIONAL` per rule—not a legal certification.

**When to use which**

| Need | Use |
|------|-----|
| Block or allow **this API call** on **this patient** now | `POST /api/v1/authorize` |
| Prove coverage of **control checklist** (periodic job, CI, admin dashboard) | `GET /api/v1/compliance/catalog` + `POST /api/v1/compliance/evaluate` |

---

## 3. Prerequisites on the governance platform

1. **Tenant** — `POST /api/v1/admin/tenants` with `X-Admin-Secret`.
2. **API key** — `POST /api/v1/admin/api-keys` for that tenant; store the key as a secret in your EMR (env/secret manager).
3. **Every call** from the EMR to runtime APIs uses:

   ```http
   X-API-Key: <tenant-api-key>
   Content-Type: application/json
   ```

4. **TLS** in production between EMR and governance service (reverse proxy or service mesh).

See `docs/developer-platform-api-guide.md` for admin payloads and error behavior.

---

## 4. Gate A (your EMR): keep RBAC as the first filter

- Authenticate the user (e.g. JWT).
- Enforce `SCOPE_patient.read`, `SCOPE_encounter.read`, etc., at the controller or service boundary.
- **RBAC does not replace** minimum necessary or purpose-of-use; it only answers “is this user allowed to use this endpoint family?”

---

## 5. Gate B: call `POST /api/v1/authorize` before touching PHI

### 5.1 When to call

Call **inside the service method** that would otherwise load or mutate clinical data—**after** you know `userId`, `patientId` (if applicable), resource type, and action (`READ`, `WRITE`, `list`, etc.).

Skip only for non-sensitive paths (e.g. health check) per your threat model.

### 5.2 Request shape (contract)

The governance API expects (see DTOs in the repo): `requestId` (unique UUID per call), `subject`, `resource`, `action`, optional `context` (`purpose`, `location`, `timestamp`, `attributes`).

**Example: patient read, US treatment context**

```json
{
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "subject": {
    "userId": "<jwt-sub>",
    "role": "Doctor",
    "department": "Cardiology"
  },
  "resource": {
    "type": "PatientRecord",
    "resourceId": "<patient-uuid>"
  },
  "action": "READ",
  "context": {
    "purpose": "TREATMENT",
    "timestamp": "2026-03-28T12:00:00.000Z",
    "attributes": {
      "legalBasis": "HIPAA_TREATMENT",
      "sourceSystem": "emr-backend",
      "tenantId": "<tenant-key>",
      "consentGranted": true,
      "region": "US",
      "emergencyAccess": false
    }
  }
}
```

**Example: EU + GDPR consent**

```json
{
  "context": {
    "purpose": "TREATMENT",
    "attributes": {
      "legalBasis": "GDPR_CONSENT",
      "consentGranted": true,
      "region": "EU",
      "tenantId": "acme-hospital-eu"
    }
  }
}
```

Map from your JWT:

- `subject.userId` ← `sub`
- `subject.role` ← role suitable for policy (string must match policy rules)
- `context.purpose` ← your `purpose_of_use` claim (e.g. `TREATMENT`)
- `resource.type` / `action` ← align with **policy JSON** in the governance DB (case-sensitive where the policy specifies)

### 5.3 Response handling

Successful response includes at least:

- `decision`: `ALLOW` | `DENY`
- `evaluationTraceId` — correlate logs
- `policyVersion` — content hash of the policy version used
- `runtimeUsed` — e.g. `JSON` or `OPA`
- `reason` — human-readable

**Your EMR must:**

1. If `DENY` → do not read/write PHI; return `403` or domain-specific denial.
2. If `ALLOW` → proceed to repository calls.
3. Optionally persist `evaluationTraceId` and `policyVersion` in memory for the same request’s audit ingest metadata.

### 5.4 Gap to close in your `GovernanceClient`

If your client today omits `X-API-Key` or only maps `allowed` / `reason`:

- Add header `X-API-Key`.
- Extend `AuthorizationResponseDto` to include `evaluationTraceId`, `policyVersion`, `runtimeUsed`, `decision` (enum), matching `AuthorizationDecision` in the governance API.

---

## 6. Immutable governance audit (ingest + verify)

Your **local** `audit_event` remains the EMR’s operational source of truth. The **governance platform** adds a **normalized, hashable event** and optional **blockchain evidence** depending on `GOVERNANCE_AUDIT_STORAGE`.

### 6.1 `POST /api/v1/audit/ingest`

Call **after** the operation succeeds (or also for denied authorize attempts if you want a tamper-evident denial trail—recommended for security monitoring).

**Request fields** (see `AuditIngestRequest`):

| Field | Suggested mapping from your EMR |
|--------|-----------------------------------|
| `correlationId` | Prefer **`audit_event.id`** (UUID string) for 1:1 traceability |
| `sourceSystem` | Fixed name, e.g. `emr-backend` |
| `actor` | `actor_user_id` |
| `targetResource` | Compact string, e.g. `patient:<uuid>` or `encounter:<uuid>` |
| `action` | `READ`, `LIST`, `CREATE`, … |
| `decision` | `ALLOW` (or `DENY` if recording failed authorize) |
| `timestamp` | `occurred_at` (ISO-8601) |
| `metadata` | **Put governance + compliance context here** (see below) |

**Example `metadata`**

```json
{
  "evaluationTraceId": "<from authorize response>",
  "policyVersion": "<hash>",
  "jwtPurpose": "TREATMENT",
  "patientId": "<uuid>",
  "resourceType": "patient",
  "legalBasis": "HIPAA_TREATMENT",
  "region": "US"
}
```

Do **not** put raw clinical narrative or unnecessary PHI in `metadata` unless policy and BAAs allow it; hashes and IDs are usually enough for integrity stories.

### 6.2 `GET /api/v1/audit/verify/{correlationId}`

Use for:

- Periodic reconciliation jobs
- Demonstrating tamper detection to auditors
- Integration tests after ingest

Response includes `eventHash`, `evidenceId` (if chained), `verificationStatus`.

### 6.3 Storage mode (ops)

- `GOVERNANCE_AUDIT_STORAGE=DB_ONLY` — hash stored in Postgres on the governance service
- `BLOCKCHAIN_ONLY` / `BOTH` — when Fabric (or similar) is configured; `evidenceId` ties to chain

---

## 7. Compliance catalog (HIPAA-only, GDPR-only, or both)

- **`GET /api/v1/compliance/catalog?framework=HIPAA`** — HIPAA catalog rows only  
- **`GET /api/v1/compliance/catalog?framework=GDPR`** — GDPR catalog rows only  
- **`GET /api/v1/compliance/catalog?framework=ALL`** — both  

- **`POST /api/v1/compliance/evaluate`** — body includes `"frameworks": ["HIPAA"]` or `["GDPR"]` or both, plus `evidence` map keyed by `evidence_key` from the catalog.

Use this for:

- Nightly jobs that aggregate “control evidence” from IdP, WAF, DLP, or configuration scanners
- Dashboards for security/compliance teams

It does **not** replace Gate B for a single patient read.

---

## 8. Failure modes: fail-open vs fail-closed

| Setting | Behavior | Use when |
|---------|----------|----------|
| **Fail-closed** (recommended for PHI) | Governance unreachable → **deny** access | Production clinical paths |
| **Fail-open** | Governance unreachable → allow (if you implement this in `GovernanceClient`) | Dev only, or non-PHI routes explicitly |

If you use `governance.client.fail-open=true`, document the risk: **outage bypasses policy**.

---

## 9. End-to-end checklist for your EMR team

- [ ] Issue tenant + `X-API-Key`; configure EMR secrets.
- [ ] HTTP client sends `X-API-Key` on all `/api/v1/authorize`, `/audit/*`, `/compliance/*` calls.
- [ ] Map JWT `sub`, roles, `purpose_of_use` into `AuthorizationRequest`.
- [ ] Align `resource.type` and `action` strings with the active governance policy.
- [ ] On `DENY`, return forbidden and **do not** touch clinical repositories.
- [ ] Extend client DTOs to capture `evaluationTraceId`, `policyVersion`.
- [ ] After successful (or intentionally logged denied) action, append `audit_event`, then call **`/audit/ingest`** with `correlationId = audit_event.id` and rich `metadata`.
- [ ] Optionally schedule **`/compliance/evaluate`** for organizational control coverage.
- [ ] Run **`/audit/verify`** in CI or audits for sampled `correlationId`s.

---

## 9.1 EHR backend config template (implemented shape)

Use environment variables in the EMR service (do not hardcode):

```properties
governance.client.base-url=http://localhost:8080
governance.client.api-key=${GOVERNANCE_API_KEY}
governance.client.enabled=true
governance.client.audit-ingest-enabled=true
governance.client.source-system=ehr-emr-be
governance.client.tenant-key=ehremr
governance.client.default-region=US
governance.client.default-legal-basis=HIPAA
governance.client.fail-open=false
```

Runtime request overrides are supported through headers on EHR API calls:
- `X-Legal-Basis: HIPAA|GDPR`
- `X-Region: US|EU`
- `X-Consent-Granted: true|false`
- `X-Purpose-Of-Use`, `X-Department`, `X-Location`

This enables repeatable HIPAA/GDPR deny-path experiments without redeploying.

---

## 9.2 Unauthorized access and integrity scenarios

Recommended minimum negative suite:
- **GDPR deny**: `X-Legal-Basis=GDPR`, `X-Region=EU`, `X-Consent-Granted=false`
- **Purpose mismatch**: use purpose not allowed by active policy
- **RBAC deny**: remove endpoint scope and verify RBAC blocks before policy gate
- **Policy deny ingest**: verify denied actions also appear in local `audit_event` and governance ingest ledger

For each scenario collect:
- HTTP status and response reason
- local audit row count delta
- governance ingest count delta
- verification status from `/api/v1/audit/verify/{correlationId}`

---

## 10. Related documentation

- **API reference and auth:** `docs/developer-platform-api-guide.md`
- **Spring-oriented narrative:** `docs/site/integration/spring-boot.mdx` (if present in your checkout)
- **Experiment protocol:** `docs/experiment-runbook.md`
- **Policy seeds (examples):** `src/main/resources/db/migration/V9__seed_default_policy.sql`, `V15__seed_hipaa_gdpr_policy_packs.sql`
- **Compliance catalog seeds:** `V18__compliance_catalog_rules.sql`, `V19__seed_compliance_catalog_hipaa_gdpr.sql`

---

## 11. Honest scope statement (for professors and auditors)

This platform provides **technical hooks**: policy decisions, hashed ingest, optional blockchain evidence, and structured compliance catalogs. **Legal compliance** (BAAs, DPIAs, breach processes, state law, clinical workflows) remains your organization’s responsibility. Present integrations as **defense-in-depth** and **auditability**, not as a substitute for legal review or certification.
