# EHR/EMR Backend

Demo EHR backend for the HIPAA/GDPR governance research project. This service is the **system of record for synthetic clinical data**. It does not implement HIPAA/GDPR policy logic; the **Governance Platform** is the compliance authority. The EHR backend **calls the Governance Platform** on every protected access (backend-driven integration).

## Quick start

- **Requirements**: Java 25+, Maven 3.9+, PostgreSQL 15+ (or use H2 for tests).
- **Database**: Create a database and user, then set (or use defaults in `application.properties`):

  ```properties
  spring.datasource.url=jdbc:postgresql://localhost:5432/ehr_emr
  spring.datasource.username=ehr_user
  spring.datasource.password=ehr_pass
  ```

- **Governance**: Set `governance.client.base-url` to the Governance Platform URL (e.g. `http://localhost:8081`). Set `governance.client.enabled=false` to run without the governance service (all requests allowed; for local dev).

```bash
./mvnw spring-boot:run
```

- **API docs**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **Health**: [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health)

## Authentication and identity

The backend now supports worker login and JWT authentication.

- Login endpoint: `POST /api/v1/auth/login`
- Demo users (seeded by Flyway): `admin`, `clinician1`, `nurse1`, `researcher1`, `billing1`
- Demo passwords:
  - `admin123!`
  - `clinician123!`
  - `nurse123!`
  - `researcher123!`
  - `billing123!`

Use `Authorization: Bearer <token>` for protected APIs.

## Header-mode identity (backward compatibility)

The frontend sends these headers to the EHR backend (it does **not** call the Governance Platform):

- **X-User-Id** (required): UUID of the user/caller.
- **X-Purpose-Of-Use** (optional): e.g. `TREATMENT`, `RESEARCH`. Defaults to `TREATMENT`.

Without `X-User-Id`, the backend returns 401. The backend uses these values to call `POST /authorize` on the Governance Platform; if governance denies, the backend returns 403.

## Local RBAC + Governance

- Local RBAC checks run first (permissions like `patient.read`, `patient.update`, etc.).
- Governance authorization still runs in the service layer as the second gate.
- Request is allowed only when both local RBAC and governance allow access.

## CSV import

Default file path:

```properties
ehr.import.healthcare-csv-path=data/Healthcare data.csv
```

**Load into EMR API tables** (what `/api/v1/patients` and related endpoints return) — each CSV row’s **`Patient_ID`** becomes `patients.id`; **`Age`** and **`Gender`** are stored; names/addresses/phone/email are left null unless you add them via API. Encounter `reason` carries vitals and visit context from the row.

```bash
curl -X POST \
  -H "Authorization: Bearer <admin-token>" \
  "http://localhost:8080/api/v1/admin/import/healthcare-emr-data?replace=true"
```

Use `replace=true` once to clear existing demo rows and audit events, then reload from the CSV. The full file is large (~51k rows); for a faster smoke test set `ehr.import.emr-max-rows=2000` in `application.properties`.

**Legacy: normalized analytics tables** (separate schema for analytics experiments):

```bash
curl -X POST \
  -H "Authorization: Bearer <admin-token>" \
  http://localhost:8080/api/v1/admin/import/healthcare-data
```

## Audit trail (local)

Structured events (who, when, action, resource, optional before/after hashes) are stored in `audit_event` for research comparison with blockchain-backed logs. Only users with **`audit.read`** (seeded for **admin**) may call `GET /api/v1/admin/audit-events`. See [Frontend integration checklist](docs/FRONTEND_INTEGRATION.md).

## Tests

```bash
./mvnw test
```

Uses the `test` profile (H2 in-memory, governance disabled so tests do not require a running governance service).

## Documentation

- [Backend-driven governance integration](docs/GOVERNANCE_INTEGRATION.md) — flow, headers, and `POST /authorize` contract.
- [Frontend integration checklist](docs/FRONTEND_INTEGRATION.md) — auth, headers, call order, sample curls and JSON responses.
- [API examples (curl)](docs/API_EXAMPLES.md) — for frontend and integration testing.

## Architecture

- **Frontend → EHR backend only.** The frontend never calls the Governance Platform.
- **EHR backend → Governance Platform:** Before returning or modifying protected data, the backend calls `POST /authorize` with (userId, patientId, resourceType, action, purposeOfUse). If the response is DENY, the backend returns 403.
- **Patients, encounters, diagnoses, medications**: Stored in PostgreSQL; exposed under `/api/v1/`. Authorization is determined solely by the governance response.
