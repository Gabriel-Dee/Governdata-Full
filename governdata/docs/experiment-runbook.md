# EHR × Governance experiment runbook

This runbook is the **short matrix**. For **full step-by-step reproduction** (every endpoint, credential, env var, SQL command, and artifact path), use:

**→ [`../../experiment/EXPERIMENT_JOURNEY.md`](../../experiment/EXPERIMENT_JOURNEY.md)**

Supporting docs:

- **OPA real mode**: [`implementation-opa-real-mode.md`](implementation-opa-real-mode.md)
- **Fabric real mode**: [`implementation-fabric-real-mode.md`](implementation-fabric-real-mode.md)
- **LaTeX results** (PDF-ready): `experiment/GovernData_Experimentation_Results.tex`
- **Raw JSON outputs**: `experiment/raw/` (e.g. `full_experiment_*.json`, `matrix_summary_*.json`, `tamper_journey_run.json`)

---

## 1) Baseline setup

- Start PostgreSQL (`governdata` database) and apply migrations.
- Start OPA (real mode): see implementation guide.
- Start Fabric test-network + chaincode (real mode): see implementation guide.
- Start `governdata` with `GOVERNANCE_BLOCKCHAIN_STUB=false` and correct `FABRIC_*` paths.
- Optional: start `ehr-emr-be` on port 8082 with `GOVERNANCE_API_KEY` in `.env`.

---

## 2) Experiment matrix (thesis alignment)

| ID | Runtime | Audit storage | Path | Goal |
|----|---------|---------------|------|------|
| E1 | JSON / OPA | BOTH | Authorized | Policy latency + correctness |
| E2 | OPA | DB_ONLY vs BOTH | Authorized | DB vs chain overhead |
| E3 | OPA | BLOCKCHAIN_ONLY | Authorized | Chain-only ingest/verify |
| E4 | Either | BOTH | Policy version | `policyVersion` in response |
| E5 | Either | BOTH | Unauthorized / invalid | Deny + audit trail |
| E6 | All | All | Latency | Compare `experiment/raw/matrix_summary_*.json` |

**Automated**: `experiment/scripts/run_governance_matrix.sh` + `experiment/scripts/full_experiment_run.py`.

---

## 3) Per-run checklist

1. Set governance env (`GOVERNANCE_POLICY_RUNTIME`, `GOVERNANCE_AUDIT_STORAGE`, `GOVERNANCE_BLOCKCHAIN_STUB`, `FABRIC_*`, `GOVERNANCE_POLICY_OPA_*`).
2. Restart governance.
3. Run `python3 experiment/scripts/full_experiment_run.py --label <RUN_ID>`.
4. Archive `experiment/raw/full_experiment_<RUN_ID>_*.json`.

---

## 4) Unauthorized scenario (headers / attributes)

Use governance `POST /api/v1/authorize` with context attributes such as `consentGranted: false` and `region: EU` for GDPR-style denial tests. EHR can mirror this via `GovernanceRequestContext` headers — see integration guide.

---

## 5) Integrity verification

Sample correlation IDs from ingest; call `GET /api/v1/audit/verify/{correlationId}`. For SQL tamper steps, see **EXPERIMENT_JOURNEY.md** section 10.

---

## 6) Suggested output schema

| runId | runtime | storage | scenario | avgMs | verifyPass | notes |
|-------|---------|---------|----------|-------|------------|-------|
| … | JSON | BOTH | authorized | … | … | … |

Aggregate file example: `experiment/raw/matrix_summary_20260329.json`.
