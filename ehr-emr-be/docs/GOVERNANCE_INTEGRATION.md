# Backend-Driven Governance Integration

The EHR backend **calls the Governance Platform** on every protected access. The frontend talks only to the EHR backend; it never calls governance directly.

## Flow

1. **Frontend** sends a request to the **EHR backend** (e.g. `GET /api/v1/patients/{id}`) with headers that identify the caller.
2. **EHR backend** builds an authorization context and calls **Governance Platform** `POST /authorize`.
3. **Governance Platform** evaluates policy (e.g. rule-based, policy-as-code, or blockchain engine) and returns ALLOW or DENY.
4. **EHR backend**: if ALLOW, fetches data and returns it to the frontend; if DENY, returns **403 Forbidden**.

## Headers the frontend must send

| Header | Required | Description |
|--------|----------|-------------|
| `X-User-Id` | Yes | UUID of the user/caller. Used as `userId` in the authorization request. |
| `X-Purpose-Of-Use` | No | Purpose for access (e.g. `TREATMENT`, `RESEARCH`, `BILLING`). Defaults to `TREATMENT` if omitted. |

Without `X-User-Id`, the EHR backend returns **401 Unauthorized**.

## Governance contract (EHR backend → Governance Platform)

### POST /authorize

**Request body (JSON):**

```json
{
  "userId": "uuid-of-caller",
  "patientId": "uuid-of-patient-or-null",
  "resourceType": "patient|encounter|diagnosis|medication",
  "action": "read|list|create|update",
  "purposeOfUse": "TREATMENT"
}
```

- `patientId`: null for list/create (when no specific patient); required for read/update on a specific resource.
- `resourceType`: `patient`, `encounter`, `diagnosis`, or `medication`.
- `action`: `read`, `list`, `create`, or `update`.

**Response (200 OK, JSON):**

```json
{
  "allowed": true,
  "decisionId": "optional-id-for-audit",
  "reason": null,
  "expiresAt": "2025-02-10T12:00:00Z"
}
```

- For **deny**, governance may return **403** with a body like `{ "allowed": false, "reason": "..." }`, or the EHR backend treats non-2xx as deny when `fail-open=false`.

## EHR backend configuration

```properties
governance.client.base-url=http://localhost:8081
governance.client.timeout-ms=5000
governance.client.enabled=true
governance.client.fail-open=false
```

- **enabled=false** (or base-url blank): no outbound call; every request is allowed (for local dev without the governance service).
- **fail-open=true**: on governance timeout/error, allow access; **fail-open=false**: deny (recommended for research).

## Separation of concerns

- **Frontend**: UI only; sends `X-User-Id` and `X-Purpose-Of-Use` to the EHR backend.
- **EHR backend**: Stores data; **must** call governance before returning or modifying protected data; does not implement HIPAA/GDPR rules.
- **Governance Platform**: Single source of truth for compliance; evaluates policies and returns allow/deny.
