# API Examples for Frontend

Base URL (local): `http://localhost:8080`

The **frontend talks only to the EHR backend**. Send identity headers on every request; the EHR backend calls the Governance Platform to authorize access.

## Login (worker authentication)

```bash
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"clinician1","password":"clinician123!"}' \
  http://localhost:8080/api/v1/auth/login | jq
```

Use the returned `accessToken`:

```bash
TOKEN="<paste-access-token>"
```

## Required headers

```http
Authorization: Bearer $TOKEN
X-User-Id: <uuid-of-the-user>   # optional backward-compat mode
X-Purpose-Of-Use: TREATMENT   (optional; defaults to TREATMENT)
```

Missing JWT (or backward-compat identity header) results in **401 Unauthorized**. If governance denies the request, the backend returns **403 Forbidden**.

---

## Health and Info

```bash
# Health (always public)
curl -s http://localhost:8080/actuator/health | jq

# Info (requires X-User-Id)
curl -s -H "X-User-Id: 11111111-1111-1111-1111-111111111111" \
  http://localhost:8080/api/v1/info | jq
```

---

## Patients

```bash
USER_ID="11111111-1111-1111-1111-111111111111"

# Get patient by ID
curl -s -H "X-User-Id: $USER_ID" -H "X-Purpose-Of-Use: TREATMENT" \
  "http://localhost:8080/api/v1/patients/a1b2c3d4-e5f6-4789-a012-000000000001" | jq

# List patients (pageable)
curl -s -H "X-User-Id: $USER_ID" \
  "http://localhost:8080/api/v1/patients?page=0&size=20" | jq

# List patients by last name
curl -s -H "X-User-Id: $USER_ID" \
  "http://localhost:8080/api/v1/patients?lastName=Smith" | jq

# Create patient
curl -s -X POST -H "X-User-Id: $USER_ID" \
  -H "Content-Type: application/json" \
  -d '{"mrn":"MRN-NEW","firstName":"Jane","lastName":"Doe","dob":"1988-02-20","gender":"F"}' \
  "http://localhost:8080/api/v1/patients" | jq

# Update patient
curl -s -X PUT -H "X-User-Id: $USER_ID" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Jane","lastName":"Doe-Updated"}' \
  "http://localhost:8080/api/v1/patients/<patient-uuid>" | jq
```

---

## Encounters

```bash
# List encounters for a patient
curl -s -H "X-User-Id: $USER_ID" \
  "http://localhost:8080/api/v1/patients/<patient-id>/encounters?page=0&size=20" | jq

# Get encounter by ID
curl -s -H "X-User-Id: $USER_ID" \
  "http://localhost:8080/api/v1/encounters/<encounter-id>" | jq

# Create encounter
curl -s -X POST -H "X-User-Id: $USER_ID" \
  -H "Content-Type: application/json" \
  -d '{"encounterDate":"2025-02-10T10:00:00Z","type":"outpatient","reason":"Follow-up","providerId":"PROV001","location":"Clinic A"}' \
  "http://localhost:8080/api/v1/patients/<patient-id>/encounters" | jq
```

---

## Diagnoses

```bash
# List diagnoses for a patient
curl -s -H "X-User-Id: $USER_ID" \
  "http://localhost:8080/api/v1/patients/<patient-id>/diagnoses?page=0&size=20" | jq

# List diagnoses for an encounter
curl -s -H "X-User-Id: $USER_ID" \
  "http://localhost:8080/api/v1/encounters/<encounter-id>/diagnoses?page=0&size=20" | jq

# Create diagnosis
curl -s -X POST -H "X-User-Id: $USER_ID" \
  -H "Content-Type: application/json" \
  -d '{"code":"Z00.00","description":"General examination","onsetDate":"2025-01-01","encounterId":"<encounter-uuid>"}' \
  "http://localhost:8080/api/v1/patients/<patient-id>/diagnoses" | jq
```

---

## Medications

```bash
# List medications for a patient
curl -s -H "X-User-Id: $USER_ID" \
  "http://localhost:8080/api/v1/patients/<patient-id>/medications?page=0&size=20" | jq

# Create medication
curl -s -X POST -H "X-User-Id: $USER_ID" \
  -H "Content-Type: application/json" \
  -d '{"drugName":"Lisinopril","dose":"10 mg","route":"oral","frequency":"once daily","startDate":"2025-01-01","prescribingProviderId":"PROV001"}' \
  "http://localhost:8080/api/v1/patients/<patient-id>/medications" | jq
```

---

## Error responses

- **401 Unauthorized**: Missing or invalid `X-User-Id`.
- **403 Forbidden**: Governance denied the request (or governance unreachable when `fail-open=false`).
- **404 Not Found**: Resource does not exist.
- **400 Bad Request**: Validation error; body may include `fieldErrors`.

Example error body:

```json
{
  "timestamp": "2025-02-10T12:00:00Z",
  "status": 404,
  "error": "Not Found",
  "message": "Patient not found: <id>",
  "path": "/api/v1/patients/<id>"
}
```

---

## OpenAPI / Swagger

- **OpenAPI JSON**: `http://localhost:8080/api-docs`
- **Swagger UI**: `http://localhost:8080/swagger-ui.html`

Add header `X-User-Id` (and optionally `X-Purpose-Of-Use`) when testing protected endpoints.
