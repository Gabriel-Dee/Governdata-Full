# Frontend integration checklist

Base URL in local dev: `http://localhost:8080`. App APIs live under `/api/v1` unless noted.

Use [Swagger UI](http://localhost:8080/swagger-ui.html) for live schemas and “try it out”.

---

## 0. Research dataset: `Healthcare data.csv` → API

For the governance research UI, **treat the CSV as the only source of patient/clinical rows** returned by the EMR endpoints (no separate Flyway “demo people”).

| Item | Detail |
|------|--------|
| **File** | `data/Healthcare data.csv` (override with `ehr.import.healthcare-csv-path`). Header includes `Patient_ID`, `Age`, `Gender`, blood pressure, heart rate, cholesterol, conditions, medications, `Visit_Date`, diagnosis, hospital visits, BMI, smoker, activity. |
| **Import** | `POST /api/v1/admin/import/healthcare-emr-data?replace=true` with **admin** JWT (`staff.manage`). **`replace=true`** deletes existing EMR rows (`patients`, `encounters`, `diagnoses`, `medications`, `audit_event`) and reloads from the CSV so the DB matches the file. Use **`replace=false`** only to merge into existing data. |
| **Patient identity** | `GET /api/v1/patients` / `GET .../patients/{id}`: **`id`** is the CSV **`Patient_ID`**. **`mrn`** is the same UUID string for CSV imports (convenient stable string key). |
| **Demographics in JSON** | **`age`** and **`gender`** come from the CSV. **`firstName`**, **`lastName`**, **`dob`**, **`address`**, **`phone`**, **`email`** are **`null`** unless you set them later via `PUT`—the UI can ignore those fields and key off **`id`** only. |
| **Encounters** | One encounter per CSV row; **`reason`** aggregates diagnosis, vitals (BP, HR, cholesterol, BMI), smoker, activity, and visit count for display without extra columns. |
| **Performance** | Full file is large (~51k lines). For quick dev, set `ehr.import.emr-max-rows` in `application.properties` (e.g. `3000`); `0` means all rows. |
| **Legacy seed** | Old Flyway demo patients (Alice/Bob/Carol) are removed by migration `V7__csv_native_patients.sql`; rely on CSV import instead. |

Helper script (admin JWT, no heavy import by default): `scripts/admin-csv-research-smoke.sh`. Full RBAC matrix: `scripts/rbac-smoke-test.sh`. One-shot local reload (long-running): `scripts/run-local-emr-reload.sh`.

### 0.1 Local dev: apply migrations + reload from CSV

1. **Start the backend** from the repo root: `./mvnw spring-boot:run` (or your IDE). On startup, **Flyway** runs pending migrations (including `V7__csv_native_patients.sql` on an existing DB).
2. **Log in as admin** and obtain `accessToken` (`POST /api/v1/auth/login` with `admin` / `admin123!` in local seed).
3. **(Optional)** Tune row cap in `application.properties`: `ehr.import.emr-max-rows=0` for the full ~51k rows, or e.g. `3000` for a faster reload during UI work. Restart the app after changing this.
4. **Reload EMR tables from the CSV** (same permission as import button in admin UI — `staff.manage`):

   ```http
   POST /api/v1/admin/import/healthcare-emr-data?replace=true
   Authorization: Bearer <accessToken>
   ```

   No request body. Response: `EmrImportReport` JSON (`rowsRead`, `patientsInserted`, `encountersInserted`, …).

`replace=true` clears `patients`, `encounters`, `diagnoses`, `medications`, and `audit_event` before loading, so the DB matches the CSV only.

### 0.2 Admin UI: config + import (for frontend)

Use these in an **Admin → Dataset** (or similar) screen. Require permission **`staff.manage`** (admin user in seed).

| Step | Method | Path | Purpose |
|------|--------|------|---------|
| 1 | `GET` | `/api/v1/admin/import/healthcare-emr-config` | Show which CSV path and row cap are configured (`healthcareCsvPath`, `emrMaxRows`, `emrMaxRowsUnlimited`, `importHint`). |
| 2 | `POST` | `/api/v1/admin/import/healthcare-emr-data?replace=true` | Run full reload from CSV (show loading state; can take minutes if `emrMaxRows` is 0). |

**Example (browser / SPA):**

```javascript
const base = "http://localhost:8080/api/v1";
const token = accessToken; // from login

const cfg = await fetch(`${base}/admin/import/healthcare-emr-config`, {
  headers: { Authorization: `Bearer ${token}` },
}).then((r) => r.json());
// cfg.healthcareCsvPath, cfg.emrMaxRows, cfg.importHint

const report = await fetch(
  `${base}/admin/import/healthcare-emr-data?replace=${encodeURIComponent(true)}`,
  { method: "POST", headers: { Authorization: `Bearer ${token}` } }
).then((r) => r.json());
// report.rowsRead, report.patientsInserted, ...
```

**403** on either call if the user lacks `staff.manage`. **401** if not logged in.

---

## 1. Headers

| Header | When | Value |
|--------|------|--------|
| `Content-Type` | JSON bodies | `application/json` |
| `Authorization` | After login | `Bearer <accessToken>` from `POST /api/v1/auth/login` |
| `X-User-Id` | **Header-mode only** (no JWT): required | Caller UUID |
| `X-User-Id` | **With JWT**: optional duplicate; prefer JWT subject | Same as logged-in `userId` if you send it |
| `X-Purpose-Of-Use` | Optional | e.g. `TREATMENT`, `RESEARCH`. JWT tokens currently embed `purpose_of_use` (default `TREATMENT`). |

**Auth flow (frontend, JWT — recommended):**

1. `POST /api/v1/auth/login` → store `accessToken`, `expiresInSeconds`, `userId`, `roles`, `permissions`.
2. Send `Authorization: Bearer <accessToken>` on every `/api/v1/**` request (except login).
3. Use `LoginResponse` for UI (roles/permissions). There is no separate “whoami” JSON beyond login; `GET /api/v1/info` only confirms the app + that you’re authenticated.
4. On `401`, clear token and send the user to login.

**Backward-compatible header mode:** If you do **not** send a Bearer token but do send `X-User-Id` (valid UUID), the backend may authenticate the request for legacy flows. For normal frontend work, use JWT.

---

## 2. Suggested endpoint order (typical UI)

1. **Health** — `GET /actuator/health` (no auth).
2. **Login** — `POST /api/v1/auth/login`.
3. **Smoke JWT** — `GET /api/v1/info` with Bearer (static JSON; proves session).
4. **Patients**
   - `GET /api/v1/patients?page=0&size=20` (optional `lastName=` filter).
   - `POST /api/v1/patients`
   - `GET /api/v1/patients/{id}`
   - `PUT /api/v1/patients/{id}`
5. **Encounters**
   - `GET /api/v1/encounters?page=0&size=20` — all encounters (paged; newest `encounterDate` first)
   - `GET /api/v1/patients/{patientId}/encounters`
   - `POST /api/v1/patients/{patientId}/encounters`
   - `PUT /api/v1/patients/{patientId}/encounters/{encounterId}`
   - `GET /api/v1/encounters/{id}`
6. **Diagnoses**
   - `GET /api/v1/diagnoses?page=0&size=20` — all diagnoses (paged; newest `onsetDate` first)
   - `GET /api/v1/patients/{patientId}/diagnoses`
   - `GET /api/v1/encounters/{encounterId}/diagnoses`
   - `POST /api/v1/patients/{patientId}/diagnoses` (optional `encounterId` in body)
   - `PUT /api/v1/patients/{patientId}/diagnoses/{diagnosisId}` (optional `encounterId` in body)
   - `GET /api/v1/diagnoses/{id}`
7. **Medications**
   - `GET /api/v1/medications?page=0&size=20` — all medications (paged; newest `startDate` first)
   - `GET /api/v1/patients/{patientId}/medications`
   - `POST /api/v1/patients/{patientId}/medications`
   - `PUT /api/v1/patients/{patientId}/medications/{medicationId}`
   - `GET /api/v1/medications/{id}`
8. **Admin — load CSV into EMR tables** (required for research UI) — `POST /api/v1/admin/import/healthcare-emr-data?replace=true` (staff with `staff.manage`). Loads **`Healthcare data.csv`** into `patients`, `encounters`, `diagnoses`, `medications` using **`Patient_ID`** as `patients.id` and CSV **`Age`/`Gender`** (see **§0**). No synthetic names.
9. **Admin — legacy analytics import** — `POST /api/v1/admin/import/healthcare-data` (normalized `patient_profiles` / fact tables; not the main EMR list API).
10. **Audit (admin only)** — `GET /api/v1/admin/audit-events` (requires `audit.read`).

---

## 3. Frontend routes by role (what to show in the UI)

Drive menus and pages from `LoginResponse.permissions` (or JWT `scopes`). There is **no per-patient allow-list** yet: any principal with `patient.read` can open **any** patient UUID.

Legend: **R** read/list, **C** create, **U** update demographics, **—** no access (hide route or disable action). There are **no HTTP delete** APIs for clinical entities in this version.

| UI area | ADMIN | CLINICIAN | NURSE | RESEARCHER | BILLING |
|---------|-------|-----------|-------|------------|---------|
| Login / session | ✓ | ✓ | ✓ | ✓ | ✓ |
| Patient **list / search** | R | R | R | R | R (`patient.list` only) |
| Patient **detail** (demographics) | R | R | R | R | **—** (no `patient.read`) |
| **Create** patient | C | C | — | — | — |
| **Edit** patient demographics | U | U | — | — | — |
| Encounters (list / detail / **create**) | R+C | R+C | R+C | R only | — |
| Diagnoses (list / detail / **create**) | R+C | R+C | R+C | R only | — |
| Medications (list / detail / **create**) | R+C | R+C | R+C | R only | — |
| **Analytics** (when wired to `analytics.read`) | ✓ | — | — | ✓ | — |
| **CSV import** (`staff.manage`) | ✓ | — | — | — | — |
| **Audit log** (`audit.read`) | ✓ **only** | — | — | — | — |

---

## 4. Local audit trail (research baseline vs blockchain)

The backend appends rows to **`audit_event`** after successful clinical operations, login, and bulk import. Fields include **actor** (`actorUserId`), **timestamp** (`occurredAt`), **action** (`READ`, `LIST`, `CREATE`, `UPDATE`, …), **resource type** (`patient`, `encounter`, `diagnosis`, `medication`, `auth`, `import`), **resource id**, optional **patient id**, and **before/after SHA-256** snapshots of canonical record state (hashes may correspond to PHI—protect like clinical data).

- **Who can call the API:** only principals with permission **`audit.read`** (seeded for **ADMIN** only).
- **Who should see audit in the UI:** **admin** role only (compliance / security officer).

---

## 5. Demo credentials (local seed)

| Username      | Password         |
|---------------|------------------|
| `admin`       | `admin123!`      |
| `clinician1` | `clinician123!` |
| `nurse1`      | `nurse123!`      |
| `researcher1` | `researcher123!` |
| `billing1`    | `billing123!`    |

---

## 6. Sample curls and responses

Replace `TOKEN` with `accessToken`. Replace UUIDs with real values from prior responses.

### 6.1 Health (no auth)

```bash
curl -sS http://localhost:8080/actuator/health
```

**Example success (200):**

```json
{
  "status": "UP"
}
```

---

### 6.2 Login

```bash
curl -sS -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"clinician1","password":"clinician123!"}'
```

**Example success (200):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "expiresInSeconds": 3600,
  "userId": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
  "username": "clinician1",
  "roles": ["CLINICIAN"],
  "permissions": [
    "patient.read",
    "patient.update",
    "encounter.read",
    "encounter.create",
    "diagnosis.create",
    "medication.create"
  ]
}
```

**Invalid credentials (401):**

```json
{
  "timestamp": "2025-03-24T12:00:00.123456789+00:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid username or password",
  "path": "/api/v1/auth/login"
}
```

---

### 6.3 Info (requires JWT)

```bash
curl -sS http://localhost:8080/api/v1/info \
  -H "Authorization: Bearer TOKEN"
```

**Example success (200):**

```json
{
  "application": "ehr-emr-be",
  "description": "EHR/EMR demo backend for governance research"
}
```

**No / bad token (401):** empty body or Spring’s unauthorized handling, depending on failure path; expect **401** with no JSON body for missing Bearer.

---

### 6.4 Create patient

```bash
curl -sS -X POST http://localhost:8080/api/v1/patients \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mrn": "FE-INT-001",
    "firstName": "Alex",
    "lastName": "FrontendTest",
    "dob": "1990-01-15",
    "gender": "F",
    "address": "123 Main St",
    "phone": "+1-555-0100",
    "email": "alex@example.com"
  }'
```

**Example success (201):**

```json
{
  "id": "11111111-2222-3333-4444-555555555555",
  "mrn": "FE-INT-001",
  "firstName": "Alex",
  "lastName": "FrontendTest",
  "dob": "1990-01-15",
  "age": null,
  "gender": "F",
  "address": "123 Main St",
  "phone": "+1-555-0100",
  "email": "alex@example.com",
  "createdAt": "2025-03-24T15:00:00.123456789+00:00",
  "updatedAt": "2025-03-24T15:00:00.123456789+00:00"
}
```

All body fields are optional except the server always assigns **`id`**; if **`mrn`** is omitted it defaults to the new UUID string. **`age`** can be set for manual creates.

**Validation (400):** `ErrorResponse` with `fieldErrors` when Bean Validation fails on the request body (e.g. invalid date format).

---

### 6.5 List patients (paginated)

```bash
curl -sS "http://localhost:8080/api/v1/patients?page=0&size=20" \
  -H "Authorization: Bearer TOKEN"
```

**Example success (200)** (Spring Data `Page` — extra fields like `pageable`, `sort`, `first`, `last` may appear depending on version):

```json
{
  "content": [
    {
      "id": "11111111-2222-3333-4444-555555555555",
      "mrn": "FE-INT-001",
      "firstName": "Alex",
      "lastName": "FrontendTest",
      "dob": "1990-01-15",
      "age": null,
      "gender": "F",
      "address": "123 Main St",
      "phone": "+1-555-0100",
      "email": "alex@example.com",
      "createdAt": "2025-03-24T15:00:00.123456789+00:00",
      "updatedAt": "2025-03-24T15:00:00.123456789+00:00"
    }
  ],
  "totalElements": 1,
  "totalPages": 1,
  "size": 20,
  "number": 0
}
```

---

### 6.6 Create encounter

```bash
curl -sS -X POST "http://localhost:8080/api/v1/patients/PATIENT_UUID/encounters" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "encounterDate": "2025-03-24T14:30:00Z",
    "type": "OUTPATIENT",
    "reason": "Follow-up",
    "providerId": "prov-001",
    "location": "Clinic A"
  }'
```

**Example success (201):**

```json
{
  "id": "22222222-3333-4444-5555-666666666666",
  "patientId": "11111111-2222-3333-4444-555555555555",
  "encounterDate": "2025-03-24T14:30:00Z",
  "type": "OUTPATIENT",
  "reason": "Follow-up",
  "providerId": "prov-001",
  "location": "Clinic A",
  "createdAt": "2025-03-24T15:05:00.123456789+00:00",
  "updatedAt": "2025-03-24T15:05:00.123456789+00:00"
}
```

---

### 6.7 Create diagnosis (link to encounter via body)

```bash
curl -sS -X POST "http://localhost:8080/api/v1/patients/PATIENT_UUID/diagnoses" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "E11.9",
    "description": "Type 2 diabetes mellitus without complications",
    "onsetDate": "2024-06-01",
    "resolvedDate": null,
    "encounterId": "22222222-3333-4444-5555-666666666666"
  }'
```

**Example success (201):**

```json
{
  "id": "33333333-4444-5555-6666-777777777777",
  "patientId": "11111111-2222-3333-4444-555555555555",
  "encounterId": "22222222-3333-4444-5555-666666666666",
  "code": "E11.9",
  "description": "Type 2 diabetes mellitus without complications",
  "onsetDate": "2024-06-01",
  "resolvedDate": null,
  "createdAt": "2025-03-24T15:10:00.123456789+00:00",
  "updatedAt": "2025-03-24T15:10:00.123456789+00:00"
}
```

---

### 6.8 Create medication

```bash
curl -sS -X POST "http://localhost:8080/api/v1/patients/PATIENT_UUID/medications" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "drugName": "Metformin",
    "dose": "500 mg",
    "route": "oral",
    "frequency": "twice daily",
    "startDate": "2025-03-24",
    "endDate": null,
    "prescribingProviderId": "prov-001"
  }'
```

**Example success (201):**

```json
{
  "id": "44444444-5555-6666-7777-888888888888",
  "patientId": "11111111-2222-3333-4444-555555555555",
  "drugName": "Metformin",
  "dose": "500 mg",
  "route": "oral",
  "frequency": "twice daily",
  "startDate": "2025-03-24",
  "endDate": null,
  "prescribingProviderId": "prov-001",
  "createdAt": "2025-03-24T15:12:00.123456789+00:00",
  "updatedAt": "2025-03-24T15:12:00.123456789+00:00"
}
```

---

### 6.9 Load CSV into EMR tables (recommended for your UI)

Populates `patients`, `encounters`, `diagnoses`, `medications` from `Healthcare data.csv`. Names and contact fields are **deterministic** from each row’s `Patient_ID` (realistic-looking synthetic data, not manual test strings). Use **`replace=true`** once to wipe old EMR rows and audit rows, then reload.

```bash
curl -sS -X POST \
  "http://localhost:8080/api/v1/admin/import/healthcare-emr-data?replace=true" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Example success (200):**

```json
{
  "rowsRead": 51000,
  "patientsInserted": 1200,
  "encountersInserted": 51000,
  "diagnosesInserted": 51000,
  "medicationsInserted": 48000,
  "skippedRows": 0,
  "replacedExistingData": true
}
```

Full import can take several minutes. Cap rows for dev with `ehr.import.emr-max-rows` in `application.properties`.

**Non-admin (403):** standard `ErrorResponse`.

---

### 6.10 Legacy CSV import (analytics tables only)

Does **not** fill the main `patients` API; use **§6.9** for EMR list/detail endpoints.

```bash
curl -sS -X POST http://localhost:8080/api/v1/admin/import/healthcare-data \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Example success (200):**

```json
{
  "processedRows": 50000,
  "insertedPatients": 1200,
  "insertedEncounters": 3400,
  "invalidRows": 42
}
```

**Non-admin (403):** standard `ErrorResponse`.

---

### 6.11 List audit events (**admin only**, `audit.read`)

```bash
curl -sS "http://localhost:8080/api/v1/admin/audit-events?page=0&size=20" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

Optional query params: `resourceType` (e.g. `patient`, `auth`, `import`), `actorUserId` (UUID).

**Example success (200)** — Spring `Page` of audit rows (shape abbreviated):

```json
{
  "content": [
    {
      "id": "66666666-7777-8888-9999-aaaaaaaaaaaa",
      "occurredAt": "2025-03-24T16:00:00.123456789+00:00",
      "actorUserId": "30000000-0000-0000-0000-000000000002",
      "action": "READ",
      "resourceType": "patient",
      "resourceId": "11111111-2222-3333-4444-555555555555",
      "patientId": "11111111-2222-3333-4444-555555555555",
      "beforeStateHash": null,
      "afterStateHash": "a1b2c3d4e5f6789012345678901234567890abcdef0123456789abcdef012345"
    }
  ],
  "totalElements": 1,
  "totalPages": 1,
  "size": 20,
  "number": 0
}
```

**Non-admin (403):** standard `ErrorResponse`.

---

### 6.12 OpenAPI (no auth)

```bash
curl -sS -o /dev/null -w "%{http_code}\n" http://localhost:8080/api-docs
curl -sS -o /dev/null -w "%{http_code}\n" http://localhost:8080/swagger-ui.html
```

Expect **200**.

---

## 7. Error shape (typical)

JSON errors use `ErrorResponse`:

- `timestamp`, `status`, `error`, `message`, `path`
- optional `fieldErrors`: `[{ "field", "message" }]`

| Code | Typical cause |
|------|----------------|
| 401 | Missing/invalid JWT; bad login |
| 403 | `@PreAuthorize` / RBAC; or governance **DENY** when enabled |
| 404 | Unknown id (`ResourceNotFoundException`) |
| 400 | Validation (`MethodArgumentNotValidException`) or bad argument |

---

## 8. Environment notes

- **Governance:** The backend can call the Governance Platform on protected operations. With `governance.client.fail-open=true` (common in local dev), governance failures may still allow the request after local RBAC passes—verify production settings.
- **JWT:** Claims include `scopes` (permission strings), `roles`, `purpose_of_use`. Align UI gates with `LoginResponse.permissions` or decode claims if needed.
- **CORS:** If the SPA runs on another origin, configure CORS to allow your frontend origin and `Authorization`.

---

## 9. Related docs

- [GOVERNANCE_INTEGRATION.md](GOVERNANCE_INTEGRATION.md) — backend → governance `POST /authorize`.
- [API_EXAMPLES.md](API_EXAMPLES.md) — additional curl patterns.
