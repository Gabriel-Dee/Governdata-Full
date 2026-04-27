# Governance-as-a-Service Developer API Guide

**What this document is:** the **complete HTTP API reference** for the Governance Platform: every route, auth header, request shape, and a **copy-paste `curl`** example per endpoint. Use it when building **any** client: EHR/EMR backends, automation, or a **BFF (backend-for-frontend)** that your **admin UI** calls—**never** put admin secrets or raw API keys in a public browser bundle (see `docs/site/platform-roles-and-frontend.mdx` for UI-specific rules).

**What this document is not:** a frontend framework tutorial. For **portal UI** (register, login, keys, snippets), see **`docs/frontend-developer-portal-guide.md`**. For routed docs-site pages (`/getting-started`, `/integration/spring-boot`, etc.), see **`docs/site/`**.

---

## Complete endpoint index

| Method | Path | Auth |
|--------|------|------|
| `POST` | `/api/v1/admin/tenants` | `X-Admin-Secret` |
| `GET` | `/api/v1/admin/tenants` | `X-Admin-Secret` |
| `GET` | `/api/v1/admin/tenants/{tenantId}` | `X-Admin-Secret` |
| `POST` | `/api/v1/admin/api-keys` | `X-Admin-Secret` |
| `GET` | `/actuator/health` | None |
| `GET` | `/actuator/info` | None |
| `POST` | `/api/v1/authorize` | `X-API-Key` |
| `GET` | `/api/v1/audit/{requestId}` | `X-API-Key` |
| `POST` | `/api/v1/audit/ingest` | `X-API-Key` |
| `GET` | `/api/v1/audit/verify/{correlationId}` | `X-API-Key` |
| `GET` | `/api/v1/metrics` | `X-API-Key` |
| `GET` | `/api/v1/compliance/catalog` | `X-API-Key` |
| `POST` | `/api/v1/compliance/evaluate` | `X-API-Key` |
| `POST` | `/api/v1/benchmark/policy-runtime` | `X-API-Key` |
| `POST` | `/api/v1/auth/register` | None |
| `POST` | `/api/v1/auth/login` | None |
| `GET` | `/api/v1/portal/me` | `Authorization: Bearer` |
| `GET` | `/api/v1/portal/api-keys` | `Authorization: Bearer` |
| `POST` | `/api/v1/portal/api-keys` | `Authorization: Bearer` |
| `DELETE` | `/api/v1/portal/api-keys/{keyId}` | `Authorization: Bearer` |
| `GET` | `/api/v1/portal/code-snippets` | `Authorization: Bearer` |

---

## 1) Base URL and transport

- **Base URL (local):** `http://localhost:8080`
- **Content type:** `application/json`
- **Protocol:** REST over HTTPS/HTTP
- **Auth today:** `X-API-Key` required for `/api/v1/**` except **`/api/v1/admin/**`**, **`/api/v1/auth/**`**, and **`/api/v1/portal/**`** (those use JWT or no auth as documented). **`actuator`** is open.
- **Self-service (recommended):** register → login → **Bearer JWT** for dashboard (`/api/v1/portal/*`) to create **`gdk_…`** API keys used by integrations.
- **Legacy operator bootstrap (optional):** `X-Admin-Secret` on **`/api/v1/admin/*`** for support/migration.

---

## 2) Integration architecture for existing hospital systems

For an **EHR/EMR-focused** end-to-end walkthrough (RBAC vs governance gates, mapping local `audit_event` to ingest, HIPAA/GDPR context, and compliance evaluation), see **`docs/ehr-emr-governance-integration-guide.md`**.

For **who creates accounts**, **API keys**, and **which doc page answers which question** (operator vs hospital IT), see **`docs/platform-onboarding-journey.md`**.

This platform is designed to sit alongside your existing Spring Boot backend and complement (not replace) your current RBAC.

### How it fits with existing RBAC

Recommended decision flow:
1. Your app authenticates user and applies local RBAC first (fast coarse-grained check).
2. Before sensitive data read/write, your app calls `POST /api/v1/authorize` for policy-as-code decision (HIPAA/GDPR/context-aware controls).
3. If decision is `ALLOW`, proceed; otherwise block and return forbidden response.
4. Send operational/security events to `POST /api/v1/audit/ingest` for normalized audit evidence.
5. Verify critical events with `GET /api/v1/audit/verify/{correlationId}` when required by compliance process.

This gives layered authorization:
- **RBAC**: who can generally access what
- **Policy-as-code**: whether this specific action is allowed under compliance context (purpose, legal basis, consent, region, emergency, etc.)

### Deployment models (including private blockchain)

#### Model A: Customer-hosted / on-prem (common for healthcare)
- Governance service is deployed in customer premises/VPC.
- Customer keeps patient DB, RBAC system, and private blockchain network in their environment.
- No mandatory external account creation in your platform.
- Best for strict data residency and hospital procurement constraints.

#### Model B: Managed SaaS
- Governance service is hosted by platform provider.
- Customer systems call provider endpoints over internet/private link.
- Typically requires tenant accounts and API credentials.
- Best for centralized operations and simpler upgrades.

#### Model C: Hybrid
- Policy decision service hosted centrally.
- Audit anchoring connector runs on-prem and writes to customer private chain.
- Useful when policy can be centralized but ledger must remain local.

### Where should the blockchain run?

For your use case (private chain), recommended default is:
- blockchain network on customer premises
- governance service configured to connect to that network

This keeps immutability proofs within customer trust boundary while still using the same API model.

---

## 2) Core concepts

### Policy enforcement runtime

Requests are evaluated by the `POLICY_CODE` engine using one runtime:
- `JSON` runtime (default): evaluates JSON DSL policies in DB
- `OPA` runtime: delegates decisions to OPA/Rego endpoint

Configured via:
- `GOVERNANCE_POLICY_RUNTIME=JSON|OPA`
- `OPA_URL` (required when `OPA`)

### Audit storage mode


Configured via:
- `GOVERNANCE_AUDIT_STORAGE=DB_ONLY|BLOCKCHAIN_ONLY|BOTH` (default in `application.yml`: **`BOTH`**)
- `GOVERNANCE_BLOCKCHAIN_STUB=true|false` (default **`true`**: synthetic `stub-tx-*` evidence ids without a live Fabric network; set **`false`** and fill `FABRIC_*` for real chain)

Behavior:
- `DB_ONLY`: governance stores the audit ingest row in Postgres only (no chain step).
- `BLOCKCHAIN_ONLY` / `BOTH`: submit to Fabric when `GOVERNANCE_BLOCKCHAIN_STUB=false` (or stub transaction id when `true`). A **metadata row** is always stored so `GET /audit/verify` can resolve the event (this is not your EMR’s clinical audit table).
- `BOTH`: same as chain path, emphasizes DB index + on-chain anchor for demos.

### IDs and uniqueness

- `requestId` for `/authorize` must be unique per request
- `correlationId` for `/audit/ingest` must be unique per event
- duplicates now return `409 Conflict` with clear message

---

## 3) Authentication and API key model

### Current implementation status
- **Self-service:** users register and log in; **JWT** protects **`/api/v1/portal/*`**. The portal creates **tenant-scoped `gdk_…` API keys** stored as hashes; integrations use **`X-API-Key`** on policy and audit routes.
- **Runtime APIs** (`/authorize`, `/audit/*`, `/compliance/*`, `/metrics`, …) require **`X-API-Key`** (tenant inferred from the key).
- **Optional admin APIs** (`/api/v1/admin/*`) still accept **`X-Admin-Secret`** for operators (listing all tenants, issuing keys by `tenantId`).

### Recommended self-service flow (Groq-style)

1. **`POST /api/v1/auth/register`** — creates **tenant + first portal user**, returns **JWT**.
2. **`POST /api/v1/auth/login`** — returns **JWT** for returning users.
3. **`POST /api/v1/portal/api-keys`** with **`Authorization: Bearer <jwt>`** — mints **`gdk_…`** keys (show once; store in your secret manager).
4. **`GET /api/v1/portal/code-snippets`** — returns curl templates (HIPAA authorize, GDPR authorize, audit ingest) using `YOUR_API_KEY` placeholder.
5. **EHR / backend** calls **`POST /api/v1/authorize`** and **`POST /api/v1/audit/ingest`** with **`X-API-Key`** only.

### Legacy operator flow (optional)

1. Operator creates tenant: `POST /api/v1/admin/tenants` with **`X-Admin-Secret`**
2. Operator issues key: `POST /api/v1/admin/api-keys` with **`X-Admin-Secret`**
3. Client systems use **`X-API-Key`** as above.

### Recommended production hardening

Use one of these options:

1. **Service-to-service JWT (preferred in enterprise)**
   - Integrate with hospital IdP (OIDC/OAuth2).
   - Validate JWT at API gateway or service filter.
   - Include tenant and service identity in token claims.

2. **API keys (implemented baseline)**
   - Issue key per client system/environment.
   - Pass via `X-API-Key` header.
   - Rotate keys and restrict by scope/tenant.

3. **Mutual TLS**
   - Strong for private network integrations.
   - Often paired with JWT/API keys.

If you choose managed SaaS, yes: companies need tenant onboarding and credentials (account + key/JWT setup).
If you choose customer-hosted mode, they can manage credentials fully in their own environment.

---

## 4) Endpoint reference

## `POST /api/v1/auth/register`

**Purpose**
- **Self-service:** create an **organization (tenant)** and the **first portal user** (email + password). Returns a **JWT** for immediate dashboard use. Does **not** require **`X-Admin-Secret`**.

**Headers**
- `Content-Type: application/json`

**Request body**
- `email` (required, unique)
- `password` (required, min 8 characters)
- `organizationDisplayName` (required)
- `tenantKey` (optional stable slug `a-z`, `0-9`, hyphen; if omitted, derived from `organizationDisplayName`)
- `displayName` (optional, user display name)

**cURL**
```bash
curl -s -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"admin@hospital.example",
    "password":"your-secure-password",
    "organizationDisplayName":"Mercy Health West",
    "tenantKey":"mercy-health-west",
    "displayName":"Jordan Lee"
  }'
```

**Success**
- HTTP `201` with `accessToken`, `tokenType` (`Bearer`), `expiresInSeconds`, `tenant`, `user`.

**Conflicts**
- `409` if **email** is already registered.

---

## `POST /api/v1/auth/login`

**Purpose**
- Obtain a **JWT** for an existing portal user.

**cURL**
```bash
curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hospital.example","password":"your-secure-password"}'
```

**Errors**
- `401` for invalid credentials or inactive tenant.

---

## `GET /api/v1/portal/me`

**Purpose**
- Return the current **tenant** and **user** for the JWT.

**Headers**
- `Authorization: Bearer <jwt>`

**cURL**
```bash
curl -s http://localhost:8080/api/v1/portal/me \
  -H "Authorization: Bearer ${PORTAL_JWT}"
```

---

## `GET /api/v1/portal/api-keys`

**Purpose**
- List API keys for the authenticated tenant (**prefix** and metadata only; not the secret `gdk_…` value).

**Headers**
- `Authorization: Bearer <jwt>`

**cURL**
```bash
curl -s http://localhost:8080/api/v1/portal/api-keys \
  -H "Authorization: Bearer ${PORTAL_JWT}"
```

---

## `POST /api/v1/portal/api-keys`

**Purpose**
- Create a new **`gdk_…`** API key for integrations. The **full key** is returned **once** in the response.

**Headers**
- `Authorization: Bearer <jwt>`
- `Content-Type: application/json`

**Request body**
- `name` (required)
- `expiresAt` (optional, ISO instant)

**cURL**
```bash
curl -s -X POST http://localhost:8080/api/v1/portal/api-keys \
  -H "Authorization: Bearer ${PORTAL_JWT}" \
  -H "Content-Type: application/json" \
  -d '{"name":"ehr-production"}'
```

---

## `DELETE /api/v1/portal/api-keys/{keyId}`

**Purpose**
- Revoke (deactivate) a key for the current tenant.

**cURL**
```bash
curl -s -X DELETE "http://localhost:8080/api/v1/portal/api-keys/1" \
  -H "Authorization: Bearer ${PORTAL_JWT}"
```

---

## `GET /api/v1/portal/code-snippets`

**Purpose**
- JSON bundle of **copy-paste curl** examples for the two main integration surfaces: **policy (HIPAA + GDPR framing)** and **immutable audit ingest**. Replace `YOUR_API_KEY` with a key from **`POST /api/v1/portal/api-keys`**. Base URL comes from server config **`GOVERNANCE_PUBLIC_BASE_URL`** (default `http://localhost:8080`).

**Headers**
- `Authorization: Bearer <jwt>`

**cURL**
```bash
curl -s http://localhost:8080/api/v1/portal/code-snippets \
  -H "Authorization: Bearer ${PORTAL_JWT}"
```

**Response shape (summary)**
- `publicBaseUrl`, `apiKeyPlaceholder`, `policyHipaa`, `policyGdpr`, `auditIngest` — each block includes `id`, `title`, `description`, `curl`.

---

## `POST /api/v1/admin/tenants`

**Purpose**
- Register one **customer organization** (hospital, health system, integration partner). **Optional operator path:** shared **`X-Admin-Secret`**. Prefer **`POST /api/v1/auth/register`** for self-service.

**Headers**
- `X-Admin-Secret: <admin-secret>`

**Request**
```json
{
  "tenantKey": "acme-hospital",
  "displayName": "Acme Hospital",
  "primaryContactEmail": "it-security@acme-hospital.org",
  "primaryContactName": "Jordan Lee",
  "primaryContactTitle": "Director of Information Security"
}
```

`primaryContactEmail`, `primaryContactName`, and `primaryContactTitle` are optional (customer representative metadata).

**Response**
```json
{
  "tenantId": 2,
  "tenantKey": "acme-hospital",
  "displayName": "Acme Hospital",
  "primaryContactEmail": "it-security@acme-hospital.org",
  "primaryContactName": "Jordan Lee",
  "primaryContactTitle": "Director of Information Security"
}
```

**cURL**
```bash
curl -s -X POST http://localhost:8080/api/v1/admin/tenants \
  -H "X-Admin-Secret: ${GOVERNANCE_ADMIN_SECRET:-change-me-admin-secret}" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantKey":"acme-hospital",
    "displayName":"Acme Hospital",
    "primaryContactEmail":"it-security@acme-hospital.org",
    "primaryContactName":"Jordan Lee",
    "primaryContactTitle":"Director of Information Security"
  }'
```

## `GET /api/v1/admin/tenants`

**Purpose**
- List all organizations (platform operations / support).

**Headers**
- `X-Admin-Secret: <admin-secret>`

**Response**
- JSON array of tenant summaries: `tenantId`, `tenantKey`, `displayName`, `active`, `primaryContactEmail`, `primaryContactName`, `primaryContactTitle`, `createdAt`, `activeApiKeyCount`.

**cURL**
```bash
curl -s http://localhost:8080/api/v1/admin/tenants \
  -H "X-Admin-Secret: ${GOVERNANCE_ADMIN_SECRET:-change-me-admin-secret}"
```

## `GET /api/v1/admin/tenants/{tenantId}`

**Purpose**
- Organization detail plus **non-secret** API key metadata (name, prefix, active, dates). Full `gdk_*` secrets are never returned after issuance.

**Headers**
- `X-Admin-Secret: <admin-secret>`

**Path params**
- `tenantId` (long)

**cURL**
```bash
curl -s "http://localhost:8080/api/v1/admin/tenants/2" \
  -H "X-Admin-Secret: ${GOVERNANCE_ADMIN_SECRET:-change-me-admin-secret}"
```

## `POST /api/v1/admin/api-keys`

**Purpose**
- Issue API key for a tenant integration.

**Headers**
- `X-Admin-Secret: <admin-secret>`

**Request**
```json
{
  "tenantId": 2,
  "name": "ehr-prod",
  "expiresAt": null
}
```

**Response**
```json
{
  "tenantId": 2,
  "tenantKey": "acme-hospital",
  "name": "ehr-prod",
  "apiKey": "gdk_xxxxxxxxx",
  "keyPrefix": "gdk_xxxxxxxx",
  "expiresAt": null
}
```

Store `apiKey` securely; plaintext is returned once at issuance.

**cURL**
```bash
curl -s -X POST http://localhost:8080/api/v1/admin/api-keys \
  -H "X-Admin-Secret: ${GOVERNANCE_ADMIN_SECRET:-change-me-admin-secret}" \
  -H "Content-Type: application/json" \
  -d '{"tenantId":2,"name":"ehr-prod","expiresAt":null}'
```

## `GET /actuator/health`

**Purpose**
- Liveness/readiness probe for service health.

**Use cases**
- Kubernetes probe
- CI smoke checks
- pre-flight before integration tests

**Example**
```bash
curl -s http://localhost:8080/actuator/health
```

**Typical response**
```json
{"groups":["liveness","readiness"],"status":"UP"}
```

## `GET /actuator/info`

**Purpose**
- Application info (Spring Boot `info` endpoint). Exposed when `management.endpoints.web.exposure` includes `info`.

**cURL**
```bash
curl -s http://localhost:8080/actuator/info
```

---

## `POST /api/v1/authorize`

**Purpose**
- Evaluate one access request against active policy and return `ALLOW`/`DENY`.

**Request body**
- `requestId` (UUID, required, unique)
- `subject` (required)
  - `userId` (required)
  - `role` (required)
  - `department` (optional)
- `resource` (required)
  - `type` (required)
  - `resourceId` (required)
- `action` (required)
- `context` (optional)
  - `purpose`, `location`, `timestamp`
  - `attributes` (free-form map: `legalBasis`, `consentGranted`, `region`, `tenantId`, etc.)

**cURL**
```bash
curl -s -X POST http://localhost:8080/api/v1/authorize \
  -H "X-API-Key: ${GOVERNANCE_API_KEY:-<tenant-api-key>}" \
  -H "Content-Type: application/json" \
  -d '{
    "requestId":"5a1e312f-b1c8-4af8-a6e8-a67bc4a53884",
    "subject":{"userId":"doctor-1","role":"Doctor","department":"Cardiology"},
    "resource":{"type":"PatientRecord","resourceId":"patient-123"},
    "action":"READ",
    "context":{
      "purpose":"treatment",
      "location":"hospital",
      "timestamp":"2026-03-26T00:00:00.000Z",
      "attributes":{"legalBasis":"HIPAA","consentGranted":true,"region":"US"}
    }
  }'
```

**JavaScript/TypeScript (`fetch`)**
```ts
const res = await fetch("http://localhost:8080/api/v1/authorize", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": process.env.GOVERNANCE_API_KEY!
  },
  body: JSON.stringify({
    requestId: crypto.randomUUID(),
    subject: { userId: "doctor-1", role: "Doctor", department: "Cardiology" },
    resource: { type: "PatientRecord", resourceId: "patient-123" },
    action: "READ",
    context: {
      purpose: "treatment",
      location: "hospital",
      timestamp: new Date().toISOString(),
      attributes: { legalBasis: "HIPAA", consentGranted: true, region: "US" }
    }
  })
});
const data = await res.json();
```

**Python (`requests`)**
```python
import uuid, requests, datetime

payload = {
    "requestId": str(uuid.uuid4()),
    "subject": {"userId": "doctor-1", "role": "Doctor", "department": "Cardiology"},
    "resource": {"type": "PatientRecord", "resourceId": "patient-123"},
    "action": "READ",
    "context": {
        "purpose": "treatment",
        "location": "hospital",
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "attributes": {"legalBasis": "HIPAA", "consentGranted": True, "region": "US"}
    }
}
r = requests.post(
    "http://localhost:8080/api/v1/authorize",
    headers={"X-API-Key": "<tenant-api-key>"},
    json=payload,
    timeout=10,
)
print(r.status_code, r.json())
```

**Success response**
```json
{
  "decision":"DENY",
  "engine":"POLICY_CODE",
  "policyVersion":"e4ffff82ae1896b1a45c16a4d31ec2c1dbb496afdf60877df5d816767b66e4f5",
  "policyVersionId":1,
  "evidenceId":null,
  "reason":"No policy rule matched",
  "runtimeUsed":"JSON",
  "evaluationTraceId":"247c3213-c989-4643-ad81-63b8f754295c"
}
```

**Response fields**
- `decision`: `ALLOW|DENY`
- `engine`: currently `POLICY_CODE`
- `policyVersion`: active policy content hash
- `policyVersionId`: DB version ID
- `evidenceId`: blockchain tx id when anchored
- `reason`: explanation for decision
- `runtimeUsed`: `JSON|OPA`
- `evaluationTraceId`: trace token for troubleshooting

---

## `GET /api/v1/audit/{requestId}`

**Purpose**
- Retrieve normalized audit record for an authorization request.

**Path params**
- `requestId` (UUID)

**cURL**
```bash
curl -s "http://localhost:8080/api/v1/audit/5a1e312f-b1c8-4af8-a6e8-a67bc4a53884" \
  -H "X-API-Key: ${GOVERNANCE_API_KEY:-<tenant-api-key>}"
```

**Success response highlights**
- request envelope (`subject/resource/action/context`)
- decision envelope (`decision/engineUsed/reason/latencyMs`)
- verification envelope (`eventHash/chainNetwork/anchorTimestamp/verificationStatus`)

**Not found**
- returns `404` if no audit entry exists for the given request id.

---

## `POST /api/v1/audit/ingest`

**Purpose**
- Ingest external audit events from other systems into governance audit model.

**Request body**
- `sourceSystem` (required)
- `actor` (required)
- `targetResource` (required)
- `action` (required)
- `decision` (required)
- `timestamp` (required, ISO instant)
- `correlationId` (required, unique)
- `metadata` (optional free-form object)

**cURL**
```bash
curl -s -X POST http://localhost:8080/api/v1/audit/ingest \
  -H "X-API-Key: ${GOVERNANCE_API_KEY:-<tenant-api-key>}" \
  -H "Content-Type: application/json" \
  -d '{
    "sourceSystem":"ehr",
    "actor":"doctor-1",
    "targetResource":"patient-123",
    "action":"READ",
    "decision":"ALLOW",
    "timestamp":"2026-03-26T00:00:00Z",
    "correlationId":"corr-1743000000",
    "metadata":{"module":"encounters","channel":"web"}
  }'
```

**Success response** (shape depends on `GOVERNANCE_AUDIT_STORAGE` / stub; with defaults **`BOTH`** + **`GOVERNANCE_BLOCKCHAIN_STUB=true`** you may see `evidenceId` like `stub-tx-*` and `verificationStatus` **`ANCHORED`**)
```json
{
  "correlationId":"corr-1743000000",
  "eventHash":"6c9abcabcbd572eae407093000642aa43c6a5c20cc8109b5baa9e1a61fc7d4c2",
  "evidenceId":"stub-tx-xxxxxxxx",
  "chainNetwork":"hyperledger-fabric",
  "anchorTimestamp":"2026-03-28T12:00:00Z",
  "verificationStatus":"ANCHORED"
}
```

---

## `GET /api/v1/audit/verify/{correlationId}`

**Purpose**
- Verify ingested audit event consistency and blockchain anchor (if present).

**Path params**
- `correlationId` (string)

**cURL**
```bash
curl -s "http://localhost:8080/api/v1/audit/verify/corr-1743000000" \
  -H "X-API-Key: ${GOVERNANCE_API_KEY:-<tenant-api-key>}"
```

**Statuses**
- `VERIFIED`: event record is consistent (and blockchain check passes when evidence exists)
- `MISMATCH`: evidence exists but verification failed
- `NOT_FOUND`: no event for given correlation id

---

## `GET /api/v1/metrics`

**Purpose**
- Operational decision metrics and latency stats.

**cURL**
```bash
curl -s http://localhost:8080/api/v1/metrics \
  -H "X-API-Key: ${GOVERNANCE_API_KEY:-<tenant-api-key>}"
```

**Response includes**
- `decisionCountByEngine`
- `denyCountByEngine`
- `latencyByEngine[]` with `avgMs`, `minMs`, `maxMs`, `p50Ms`, `p95Ms`, `p99Ms`

---

## `GET /api/v1/compliance/catalog`

**Purpose**
- Return the seeded **HIPAA / GDPR compliance rule catalog** (reference rows + optional `evidenceKey` for automated evaluation). Does not replace `/authorize`; use for dashboards and organizational attestations.

**Headers**
- `X-API-Key: <tenant-api-key>`

**Query params**
- `framework` — `HIPAA`, `GDPR`, or `ALL` (default when omitted: both frameworks).

**cURL**
```bash
curl -s "http://localhost:8080/api/v1/compliance/catalog?framework=HIPAA" \
  -H "X-API-Key: ${GOVERNANCE_API_KEY:-<tenant-api-key>}"

curl -s "http://localhost:8080/api/v1/compliance/catalog?framework=ALL" \
  -H "X-API-Key: ${GOVERNANCE_API_KEY:-<tenant-api-key>}"
```

**Success response**
- JSON array of catalog rules (`ruleCode`, `framework`, `category`, `legalReference`, `evidenceKey`, `automated`, etc.).

---

## `POST /api/v1/compliance/evaluate`

**Purpose**
- Score **submitted evidence** (boolean flags keyed by `evidenceKey` from the catalog) for one or both frameworks. Returns per-rule `PASS` / `FAIL` / `UNKNOWN` / `INFORMATIONAL` and a summary.

**Headers**
- `X-API-Key: <tenant-api-key>`
- `Content-Type: application/json`

**Request body**
```json
{
  "frameworks": ["HIPAA", "GDPR"],
  "evidence": {
    "hipaa_audit_controls": true,
    "hipaa_access_unique_user_id": true,
    "gdpr_records_of_processing_maintained": false
  }
}
```

**cURL**
```bash
curl -s -X POST http://localhost:8080/api/v1/compliance/evaluate \
  -H "X-API-Key: ${GOVERNANCE_API_KEY:-<tenant-api-key>}" \
  -H "Content-Type: application/json" \
  -d '{"frameworks":["HIPAA"],"evidence":{"hipaa_audit_controls":true,"hipaa_access_unique_user_id":false}}'
```

**Success response**
- `frameworksEvaluated`, `summary`, `overallAutomatedStatus`, `disclaimer`, `results[]` with per-rule status.

---

## `POST /api/v1/benchmark/policy-runtime`

**Purpose**
- Run controlled benchmark over a corpus of authorization requests.

**Request body**
- `requests` (required, non-empty array of `AuthorizationRequest`)
- `iterations` (optional, minimum `1`, default `1`)

**cURL**
```bash
curl -s -X POST http://localhost:8080/api/v1/benchmark/policy-runtime \
  -H "X-API-Key: ${GOVERNANCE_API_KEY:-<tenant-api-key>}" \
  -H "Content-Type: application/json" \
  -d '{
    "iterations": 3,
    "requests": [{
      "requestId":"e3b38039-63bf-4ab0-b9c0-4ff4d27eeb5d",
      "subject":{"userId":"doctor-2","role":"Doctor","department":"ICU"},
      "resource":{"type":"PatientRecord","resourceId":"patient-456"},
      "action":"READ",
      "context":{
        "purpose":"treatment",
        "timestamp":"2026-03-26T00:00:00.000Z",
        "attributes":{"legalBasis":"HIPAA","consentGranted":true,"region":"US"}
      }
    }]
  }'
```

**Response**
```json
{
  "runtime":"JSON",
  "iterations":3,
  "totalRequests":1,
  "totalEvaluations":3,
  "allowCount":0,
  "denyCount":3,
  "averageLatencyMs":6.0,
  "p95LatencyMs":7
}
```

---

## 5) Error contract (structured)

All handled client/server errors return:
```json
{
  "timestamp":"2026-03-26T17:40:00.000Z",
  "status":400,
  "error":"Bad Request",
  "message":"Validation failed",
  "path":"/api/v1/authorize",
  "violations":[
    {"field":"subject.userId","message":"subject.userId is required","rejectedValue":""}
  ]
}
```

### Common status codes
- `200` success
- `400` malformed JSON or validation error
- `401` missing or invalid `X-API-Key` (or invalid admin secret on `/api/v1/admin/*`) when API key auth is enabled
- `404` audit record not found
- `409` duplicate unique id (`requestId` or `correlationId`)
- `500` unexpected server error

---

## 6) Spring Boot integration blueprint (Java-first)

This section is the direct implementation path for your current scenario: an existing Spring Boot backend with patient data + RBAC.

### 6.1 Minimal integration strategy

- Keep your current RBAC implementation as-is.
- Add a Governance client to call `/api/v1/authorize` before sensitive actions.
- Add audit forwarder to call `/api/v1/audit/ingest` for key events.
- Keep your existing patient schema unchanged; map request context into governance payload.

### 6.2 Spring configuration (`application.yml`)

```yaml
governance:
  base-url: http://localhost:8080
  api-key: ${GOVERNANCE_API_KEY:} # optional today; useful when auth is enabled
```

### 6.3 `WebClient` bean

```java
@Configuration
public class GovernanceClientConfig {

    @Bean
    WebClient governanceWebClient(
            @Value("${governance.base-url}") String baseUrl,
            @Value("${governance.api-key:}") String apiKey
    ) {
        return WebClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeaders(headers -> {
                    if (apiKey != null && !apiKey.isBlank()) {
                        headers.add("X-API-Key", apiKey);
                    }
                })
                .build();
    }
}
```

### 6.4 Thin Java client for policy check

```java
@Service
@RequiredArgsConstructor
public class GovernancePolicyClient {
    private final WebClient governanceWebClient;

    public AuthorizationDecision authorize(AuthorizationRequest request) {
        return governanceWebClient.post()
                .uri("/api/v1/authorize")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(AuthorizationDecision.class)
                .block();
    }
}
```

### 6.5 Enforce policy before patient data access

```java
@Service
@RequiredArgsConstructor
public class PatientAccessService {
    private final GovernancePolicyClient governancePolicyClient;
    private final PatientRepository patientRepository;

    public PatientRecord getPatientRecord(UserPrincipal user, String patientId) {
        // Existing RBAC check in your app (already implemented)
        if (!user.hasRole("Doctor") && !user.hasRole("Nurse")) {
            throw new AccessDeniedException("RBAC denied");
        }

        // Fine-grained compliance policy check
        AuthorizationRequest req = AuthorizationRequest.builder()
                .requestId(UUID.randomUUID())
                .subject(SubjectDTO.builder()
                        .userId(user.getUserId())
                        .role(user.getPrimaryRole())
                        .department(user.getDepartment())
                        .build())
                .resource(ResourceDTO.builder()
                        .type("PatientRecord")
                        .resourceId(patientId)
                        .build())
                .action("READ")
                .context(ContextDTO.builder()
                        .purpose("treatment")
                        .timestamp(Instant.now())
                        .attributes(Map.of(
                                "legalBasis", "HIPAA",
                                "consentGranted", true,
                                "region", "US",
                                "sourceSystem", "hospital-ehr"
                        ))
                        .build())
                .build();

        AuthorizationDecision decision = governancePolicyClient.authorize(req);
        if (decision.getDecision() != AuthorizationDecision.Decision.ALLOW) {
            throw new AccessDeniedException("Policy denied: " + decision.getReason());
        }

        return patientRepository.findById(patientId)
                .orElseThrow(() -> new EntityNotFoundException("Patient not found"));
    }
}
```

### 6.6 Forward audit events for immutable evidence

```java
@Service
@RequiredArgsConstructor
public class GovernanceAuditClient {
    private final WebClient governanceWebClient;

    public void publishAuditEvent(String actor, String patientId, String action, String outcome) {
        AuditIngestRequest body = AuditIngestRequest.builder()
                .sourceSystem("hospital-ehr")
                .actor(actor)
                .targetResource(patientId)
                .action(action)
                .decision(outcome)
                .timestamp(Instant.now())
                .correlationId("ehr-" + UUID.randomUUID())
                .metadata(Map.of("module", "patient-service", "channel", "api"))
                .build();

        governanceWebClient.post()
                .uri("/api/v1/audit/ingest")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(AuditIngestResponse.class)
                .block();
    }
}
```

### 6.7 What about SDKs?

- **Snippet approach (current):** copy small client classes into your app and call REST directly.
- **SDK approach (next step):** package these classes into a reusable library (`governance-java-sdk`) with:
  - typed models
  - retries/timeouts
  - auth interceptors
  - telemetry hooks
  - versioned compatibility guarantees

So yes, what you described is exactly the start of an SDK; right now the docs provide SDK-style patterns using plain Spring Boot code.

---

## 7) Integration best practices

1. **Generate IDs client-side**
   - Always create new UUIDs for `requestId`.
   - Treat `correlationId` as immutable event identity.

2. **Make purpose/context explicit**
   - Set `context.purpose` and compliance attributes (`legalBasis`, `consentGranted`, `region`).
   - This is critical for explainable policy decisions.

3. **Store decision artifacts**
   - Persist `evaluationTraceId`, `policyVersion`, and `evidenceId` in your system logs.
   - These fields enable forensic replay and auditability.

4. **Use retry with idempotency discipline**
   - Network retry is fine, but avoid replaying with same unique IDs unless you expect `409`.

5. **Choose runtime/storage intentionally**
   - Policy: **`JSON`** (default) or **`OPA`** for external Rego.
   - Audit: **`BOTH`** (default) for metadata + chain/stub anchor; **`DB_ONLY`** only if you intentionally skip chain.

---

## 8) Docs site (MDX) map

Narrative and framework-specific guides live under **`docs/site/`** (e.g. `getting-started.mdx`, `integration/spring-boot.mdx`, `platform-roles-and-frontend.mdx`). This file remains the **canonical REST reference**.

---

## 9) Fast smoke validation

Use:
```bash
scripts/smoke-curl.sh
```

The script exercises all major endpoints and exits non-zero on failures.
