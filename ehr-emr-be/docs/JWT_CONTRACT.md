# JWT Contract for EHR Backend

**Note:** The EHR backend now uses **backend-driven governance**: the backend calls the Governance Platform `POST /authorize` on each request. The frontend sends `X-User-Id` and `X-Purpose-Of-Use` headers only. See [GOVERNANCE_INTEGRATION.md](GOVERNANCE_INTEGRATION.md). This document is retained for a possible future token-based (Phase 2) pattern.

---

The EHR backend may accept **governance-issued JWTs** in a token-based pattern (Phase 2). Tokens would conform to the following contract.

## Validation Rules

- **Algorithm**: HS256 (symmetric secret). RS256 can be added later.
- **Required standard claims**:
  - `sub` (string): Subject — identity of the user or service.
  - `exp` (number): Expiration time (Unix seconds).
  - `iat` (number): Issued at (Unix seconds).
- **Expected issuer and audience** (configurable in the EHR backend):
  - `iss`: Must match `ehr.security.jwt.issuer` (default: `governance-platform`).
  - `aud`: Must match `ehr.security.jwt.audience` (default: `ehr-backend`).

## Domain Claims (used for authorization)

| Claim            | Type   | Description |
|------------------|--------|-------------|
| `role`           | string | Role name, e.g. `DOCTOR`, `NURSE`, `AUDITOR`, `ADMIN`. Mapped to Spring Security authority `ROLE_<role>` (uppercase). |
| `scopes`         | array  | List of scope strings, e.g. `["ehr.read", "ehr.write"]`. Mapped to `SCOPE_<scope>`. |
| `scope`          | string | Single scope (alternative to `scopes`). |
| `patient_ids`    | array  | Optional list of patient UUIDs. If present, the principal may only access these patients (enforced when you add patient-level checks). |
| `purpose_of_use` | string | Optional, e.g. `TREATMENT`, `RESEARCH`, `BILLING`. For audit/correlation only in this backend. |
| `decision_id`    | string | Optional. Governance decision ID for correlation with audit logs. |

## Endpoint Access

- **Read** (GET patients, encounters, diagnoses, medications, info): Requires `SCOPE_ehr.read` **or** `ROLE_ADMIN`.
- **Write** (POST/PUT for encounters, diagnoses, medications): Requires `SCOPE_ehr.write` **or** `ROLE_ADMIN`.
- **Admin** (POST/PUT patients): Requires `ROLE_ADMIN` only.

## Configuration (EHR backend)

```properties
ehr.security.jwt.issuer=governance-platform
ehr.security.jwt.audience=ehr-backend
ehr.security.jwt.secret=<base64-or-raw-secret-at-least-256-bits-for-HS256>
ehr.security.require-jwt=true
```

Set `ehr.security.require-jwt=false` for local/open mode (no token required; a full-access principal is used).

## Example Payload (decoded)

```json
{
  "sub": "doctor-123",
  "iss": "governance-platform",
  "aud": "ehr-backend",
  "exp": 1739123456,
  "iat": 1739037056,
  "role": "DOCTOR",
  "scopes": ["ehr.read", "ehr.write"],
  "purpose_of_use": "TREATMENT",
  "decision_id": "dec-abc-001"
}
```

The governance platform must sign this payload with the same secret configured in the EHR backend (`ehr.security.jwt.secret`).
