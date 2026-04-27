# Experiment journey — full reproducibility (GovernData + EHR)

This document is the **step-by-step record** of how experiments were run in **real mode** (real OPA, real Hyperledger Fabric, no blockchain stub). Use it to **redo every experiment** later: prerequisites, ports, credentials, endpoints, SQL, and where outputs are saved.

---

## 1. What was already done vs. what you must run locally

| Item | Status | Notes |
|------|--------|--------|
| Real Fabric test-network + governance chaincode (CCAAS) | **Done in prior session** | Must be running for non-stub `evidenceId` |
| Real OPA server with Rego policy | **Done** | Policy file in repo |
| Governance Spring Boot with `GOVERNANCE_BLOCKCHAIN_STUB=false` | **Run each time** | Or use provided shell script |
| PostgreSQL `governdata` database | **Required** | Flyway migrations applied |
| Automated matrix + raw JSON artifacts | **Done** (2026-03-29) | See `experiment/raw/` |
| Tamper SQL + verify sequence | **Done** (example correlation id in JSON) | Re-run anytime; id changes each time |
| EHR UI / Postman calls | **Optional** | Same contracts as below |

If Fabric or OPA is down, experiments that need them **will fail** until you follow the implementation guides (`governdata/docs/implementation-fabric-real-mode.md`, `implementation-opa-real-mode.md`).

---

## 2. Ports and services

| Service | Port | Check |
|---------|------|--------|
| Governance API | 8080 | `curl -s http://localhost:8080/actuator/health` |
| OPA | 8181 | `curl -s http://localhost:8181/health` or OPA root |
| PostgreSQL | 5432 | `psql -d governdata -c 'select 1'` |
| EHR backend (optional) | 8082 | When running `./mvnw spring-boot:run` in `ehr-emr-be` |
| Fabric peers (Docker) | 7051, 9051, … | `docker ps` shows `peer0.org1.example.com`, etc. |

---

## 3. Credentials (reference)

### 3.1 Governance API (tenant integration)

- **Header**: `X-API-Key: <your tenant API key>`
- **Tenant key (logical)**: `ehremr` (organization EHREME)
- **Example key used in development** (store in `ehr-emr-be/.env`, do not commit secrets):

  `GOVERNANCE_API_KEY=gdk_tfNTWMEh-hmtOJ9jHQuj2UNIGYkAJsKimNUK3rJMVJE`

Replace with a new key from the GovernData portal if this is rotated.

### 3.2 EHR demo accounts (seeded)

| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin123!` | ADMIN |
| `clinician1` | `clinician123!` | CLINICIAN |
| `nurse1` | `nurse123!` | NURSE |
| `researcher1` | `researcher123!` | RESEARCHER |
| `billing1` | `billing123!` | BILLING |

### 3.3 GovernData web portal (optional)

- **Email**: `gabrieldee77@gmail.com` (as provided for your project)
- **Password**: `1234567890` (as provided)
- Use for API key issuance / UI only; API calls use `X-API-Key`.

### 3.4 PostgreSQL (typical local)

- **Database**: `governdata`
- **User**: often your OS user (e.g. `gabriel`) or `postgres` depending on install
- **Connection**: `psql -d governdata`

---

## 4. Environment variables — Governance (real mode)

From repo root `governdata/`, start with:

```bash
cd /path/to/governdata

export SERVER_PORT=8080
export GOVERNANCE_BLOCKCHAIN_STUB=false
export GOVERNANCE_AUDIT_STORAGE=BOTH   # or DB_ONLY | BLOCKCHAIN_ONLY for matrix runs

# Fabric (paths are repo-relative; use absolute paths in production)
export FABRIC_CONNECTION_PROFILE="$PWD/fabric/connection-org1-rich.json"
export FABRIC_WALLET_PATH="$PWD/fabric/wallet"
export FABRIC_IDENTITY_LABEL=org1-admin
export FABRIC_CHANNEL_NAME=mychannel
export FABRIC_CHAINCODE_NAME=governance

# JSON policy runtime
# export GOVERNANCE_POLICY_RUNTIME=JSON

# OPA policy runtime (no fallback)
export GOVERNANCE_POLICY_RUNTIME=OPA
export GOVERNANCE_POLICY_OPA_URL=http://localhost:8181/v1/data/healthcare/authz/result
export GOVERNANCE_POLICY_OPA_FAIL_OPEN=false
export GOVERNANCE_POLICY_OPA_FALLBACK_JSON_ON_ERROR=false

./mvnw spring-boot:run
```

**OPA URL note**: The Rego package exposes `data.healthcare.authz.result`. The app posts `input` to OPA; use the **`/result`** document path so the decision object is a single JSON value the Java client can parse.

---

## 5. Environment variables — EHR (when testing through EHR)

In `ehr-emr-be/.env` (or shell):

```bash
GOVERNANCE_API_KEY=<same as portal integration key>
GOVERNANCE_BASE_URL=http://localhost:8080
GOVERNANCE_AUDIT_INGEST_ENABLED=true
GOVERNANCE_TENANT_KEY=ehremr
GOVERNANCE_DEFAULT_REGION=US
GOVERNANCE_DEFAULT_LEGAL_BASIS=HIPAA
GOVERNANCE_FAIL_OPEN=false
```

Start EHR:

```bash
cd ehr-emr-be
SERVER_PORT=8082 ./mvnw spring-boot:run
```

---

## 6. OPA — start server

```bash
opa run --server --addr :8181 /path/to/governdata/opa/healthcare_authz.rego
```

Policy file: `governdata/opa/healthcare_authz.rego`.

---

## 7. Endpoints used in experiments

| Method | Path | Purpose |
|--------|------|--------|
| `POST` | `/api/v1/authorize` | Policy decision + Fabric anchor (when not stub) |
| `POST` | `/api/v1/audit/ingest` | External audit event ingestion + chain anchor |
| `GET` | `/api/v1/audit/verify/{correlationId}` | Verify hash + chain evidence |
| `POST` | `/api/v1/benchmark/policy-runtime` | Server-side benchmark (use **one** iteration per corpus to avoid duplicate `requestId` — see script) |
| `GET` | `/actuator/health` | Liveness |

**EHR (optional)**:

| Method | Path |
|--------|------|
| `POST` | `/api/v1/auth/login` |
| `GET` | `/api/v1/patients/{id}` (example protected resource) |

---

## 8. Automated full matrix (recommended)

Script:

```bash
chmod +x experiment/scripts/run_governance_matrix.sh
./experiment/scripts/run_governance_matrix.sh
```

This restarts governance for:

1. `JSON` + `BOTH`
2. `OPA` + `BOTH`
3. `OPA` + `DB_ONLY`
4. `OPA` + `BLOCKCHAIN_ONLY`
5. Restores `OPA` + `BOTH`

Python capture (single run):

```bash
python3 experiment/scripts/full_experiment_run.py --label MY_RUN
```

Outputs: `experiment/raw/full_experiment_<label>_<timestamp>.json`

**Fix applied**: `/api/v1/benchmark/policy-runtime` is called with `iterations=1` because the server rejects duplicate `requestId` across iterations. Multi-iteration latency uses **client-side** `/api/v1/authorize` loops in the same script.

---

## 9. Experiment-by-experiment mapping (thesis 1–6)

### Experiment 1 — Policy engine comparison (JSON vs OPA)

- **Procedure**: Run `full_experiment_run.py` under JSON mode, then under OPA mode (matrix script does both).
- **Metrics**: `experiment1_client_latency.afterWarmupSummary` in each JSON file; `runtimeUsed` per sample.
- **Artifacts**: `experiment/raw/full_experiment_JSON_BOTH_*.json`, `full_experiment_OPA_BOTH_MATRIX_*.json`.

### Experiment 2 — DB vs blockchain audit integrity

- **Procedure**: Compare `GOVERNANCE_AUDIT_STORAGE=DB_ONLY` vs real chain modes; use ingest + verify.
- **Artifacts**: `full_experiment_OPA_DB_ONLY_*.json` (ingest/verify in file), `OPA_BLOCKCHAIN_ONLY_*.json`.

### Experiment 3 — Hybrid (DB + blockchain)

- **Procedure**: `GOVERNANCE_AUDIT_STORAGE=BOTH`, `GOVERNANCE_BLOCKCHAIN_STUB=false`.
- **Artifacts**: `full_experiment_OPA_BOTH_*.json`.

### Experiment 4 — Policy version traceability

- **Procedure**: `experiment4_policy_version` in `full_experiment_run.py` — two `/authorize` calls; compare `policyVersion` / `policyVersionId`.
- **Artifacts**: embedded in each `full_experiment_*.json`.

### Experiment 5 — Unauthorized / invalid access

- **Procedure**: `experiment5_unauthorized` — GDPR consent denied scenario.
- **Artifacts**: same JSON files.

### Experiment 6 — Latency overhead

- **Procedure**: Use `afterWarmupSummary` from client latency; compare modes in `experiment/raw/matrix_summary_20260329.json`.
- **Note**: Authorize latency with **BOTH + real Fabric** is dominated by chain commit (~2s per call locally). `DB_ONLY` shows much lower numbers when chain is not invoked for that path.

---

## 10. Tamper experiment (SQL + verify)

**Correlation ID example** (your run will differ): see `experiment/raw/tamper_journey_run.json`.

Commands:

```bash
CORR=<your-correlation-id-from-ingest>

curl -s -H "X-API-Key: $GOVERNANCE_API_KEY" \
  "http://localhost:8080/api/v1/audit/verify/$CORR"

psql -d governdata -c \
  "UPDATE external_audit_events SET actor='tampered' WHERE correlation_id='$CORR';"

curl -s -H "X-API-Key: $GOVERNANCE_API_KEY" \
  "http://localhost:8080/api/v1/audit/verify/$CORR"
# Expect: MISMATCH

psql -d governdata -c \
  "DELETE FROM external_audit_events WHERE correlation_id='$CORR';"

curl -s -H "X-API-Key: $GOVERNANCE_API_KEY" \
  "http://localhost:8080/api/v1/audit/verify/$CORR"
# Expect: VERIFIED_CHAIN_ONLY (when Fabric stub is false and chain anchor exists)
```

---

## 11. Files to archive for your thesis / presentation

- `experiment/raw/full_experiment_*.json`
- `experiment/raw/matrix_summary_20260329.json`
- `experiment/raw/tamper_journey_run.json`
- `experiment/GovernData_Experimentation_Results.tex`
- `governdata/docs/implementation-opa-real-mode.md`
- `governdata/docs/implementation-fabric-real-mode.md`

---

## 12. Troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| `401` on API | Missing/wrong `X-API-Key` |
| `409` on benchmark | Duplicate `requestId` — use `iterations=1` for benchmark or unique UUIDs per call |
| `stub-tx-*` evidence | `GOVERNANCE_BLOCKCHAIN_STUB=true` |
| OPA errors / deny all | OPA not running or wrong URL path |
| Fabric reject / timeout | Colima/Docker stopped, or chaincode containers not running |
| `psql: role` errors | Use your local Postgres user; see `application.yml` |

---

*Last updated: automated experiment matrix run 2026-03-29.*
