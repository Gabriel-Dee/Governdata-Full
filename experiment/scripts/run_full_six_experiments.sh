#!/usr/bin/env bash
# Reproduces all six experiments end-to-end and writes timestamped outputs.
# Includes automated tamper sequence (UPDATE + DELETE) for integrity validation.
#
# ------------------------------ EXPERIMENT MAP ------------------------------
# Experiment 1: Policy Engine Comparison (JSON vs OPA)
#   - Executed by run_matrix() -> run_governance_matrix.sh
#   - Data captured by full_experiment_run.py (client latency + benchmark fields)
#
# Experiment 2: DB vs Blockchain Audit Integrity
#   - Storage mode contrast in run_matrix() (OPA_DB_ONLY vs OPA_BLOCKCHAIN_ONLY)
#   - Tamper detectability sequence in run_tamper_sequence()
#
# Experiment 3: Hybrid Audit Model (DB + Blockchain)
#   - Executed in run_matrix() (JSON_BOTH and OPA_BOTH_MATRIX)
#   - Verified again in run_final_verify_capture()
#
# Experiment 4: Policy Version Traceability
#   - Captured inside full_experiment_run.py during run_final_verify_capture()
#   - Field: experiment4_policy_version
#
# Experiment 5: Unauthorized Access Handling
#   - Captured inside full_experiment_run.py during run_final_verify_capture()
#   - Field: experiment5_unauthorized
#
# Experiment 6: Latency Overhead Analysis
#   - Cross-configuration values generated in build_matrix_summary()
#   - Source metric: experiment1_client_latency.afterWarmupSummary
# ---------------------------------------------------------------------------
#
# Usage:
#   chmod +x experiment/scripts/run_full_six_experiments.sh
#   ./experiment/scripts/run_full_six_experiments.sh
#   ./experiment/scripts/run_full_six_experiments.sh --explain
#   ./experiment/scripts/run_full_six_experiments.sh --explain-only
#
# Optional env vars:
#   GOVERNANCE_API_KEY=...
#   GOV_BASE_URL=http://localhost:8080
#   GOV_DB_NAME=governdata
#   GOV_DB_URL=postgresql://localhost:5432/governdata

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXPERIMENT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
RAW_DIR="$EXPERIMENT_ROOT/raw"
MATRIX_SCRIPT="$SCRIPT_DIR/run_governance_matrix.sh"
CAPTURE_SCRIPT="$SCRIPT_DIR/full_experiment_run.py"

GOV_BASE_URL="${GOV_BASE_URL:-http://localhost:8080}"
GOVERNANCE_API_KEY="${GOVERNANCE_API_KEY:-gdk_tfNTWMEh-hmtOJ9jHQuj2UNIGYkAJsKimNUK3rJMVJE}"
GOV_DB_NAME="${GOV_DB_NAME:-governdata}"
GOV_DB_URL="${GOV_DB_URL:-}"

TIMESTAMP="$(date -u +%Y%m%d_%H%M%S)"
FINAL_LABEL="FINAL_VERIFY_${TIMESTAMP}"
MATRIX_SUMMARY_OUT="$RAW_DIR/matrix_summary_${TIMESTAMP}.json"
TAMPER_OUT="$RAW_DIR/tamper_journey_${TIMESTAMP}.json"
EXPLAIN_MODE=false
EXPLAIN_ONLY=false

print_explain_mapping() {
  cat <<EOF
========================================================================
GovernData Six-Experiment Runtime Mapping
========================================================================
Execution order in this script:

1) run_matrix()  [via run_governance_matrix.sh]
   - EXP-1 Policy Engine Comparison
   - EXP-2 DB vs Blockchain Integrity (storage mode contrast)
   - EXP-3 Hybrid Audit Model
   - EXP-6 Latency Overhead (cross-configuration basis)
   Runs:
     - JSON + BOTH
     - OPA + BOTH
     - OPA + DB_ONLY
     - OPA + BLOCKCHAIN_ONLY

2) run_final_verify_capture()  [via full_experiment_run.py]
   - EXP-1: benchmark + client latency snapshot in final mode
   - EXP-3: ingest/verify check in restored OPA+BOTH mode
   - EXP-4: policy version traceability probe
   - EXP-5: unauthorized-access scenario check

3) build_matrix_summary()
   - EXP-6 final chart-ready summary (min/max/avg/p95)

4) run_tamper_sequence()
   - EXP-2 explicit adversarial sequence:
     ingest -> verify -> SQL UPDATE tamper -> verify -> SQL DELETE -> verify

5) print_outputs()
   - Prints generated files to archive for defense evidence
========================================================================
EOF
}

require_cmd() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Missing required command: $cmd" >&2
    exit 1
  fi
}

verify_health() {
  local n=0
  until curl -sf "${GOV_BASE_URL%/}/actuator/health" >/dev/null 2>&1; do
    n=$((n + 1))
    if [[ "$n" -gt 60 ]]; then
      echo "Governance health check failed at ${GOV_BASE_URL%/}/actuator/health" >&2
      exit 1
    fi
    sleep 2
  done
}

verify_status_for_corr() {
  local corr="$1"
  local out
  out="$(curl -sS -H "X-API-Key: $GOVERNANCE_API_KEY" "${GOV_BASE_URL%/}/api/v1/audit/verify/$corr")"
  python3 -c 'import json,sys; print(json.loads(sys.argv[1]).get("verificationStatus",""))' "$out"
}

psql_exec() {
  local sql="$1"
  if [[ -n "$GOV_DB_URL" ]]; then
    psql "$GOV_DB_URL" -v ON_ERROR_STOP=1 -c "$sql" >/dev/null
  else
    psql -d "$GOV_DB_NAME" -v ON_ERROR_STOP=1 -c "$sql" >/dev/null
  fi
}

run_matrix() {
  echo "[1/5] Running matrix orchestration (JSON/OPA x storage modes)..."
  # EXP-1 + EXP-2 + EXP-3 + EXP-6 foundation:
  #   - JSON + BOTH
  #   - OPA + BOTH
  #   - OPA + DB_ONLY
  #   - OPA + BLOCKCHAIN_ONLY
  # Note: detailed step-to-step config switching is implemented in:
  #   experiment/scripts/run_governance_matrix.sh
  bash "$MATRIX_SCRIPT"
}

run_final_verify_capture() {
  echo "[2/5] Running final verification capture..."
  # EXP-1: server benchmark + client-side latency (single runtime/mode snapshot)
  # EXP-3: ingest/verify in current mode (restored OPA + BOTH by matrix script)
  # EXP-4: policy version probe (two calls)
  # EXP-5: unauthorized scenario check
  python3 "$CAPTURE_SCRIPT" \
    --base-url "$GOV_BASE_URL" \
    --api-key "$GOVERNANCE_API_KEY" \
    --label "$FINAL_LABEL" >/dev/null
}

build_matrix_summary() {
  echo "[3/5] Building matrix summary from newest run files..."
  # EXP-6 (primary output):
  # Consolidates min/max/avg/p95 latency from matrix run labels for charting.
  python3 - "$RAW_DIR" "$MATRIX_SUMMARY_OUT" <<'PY'
import json
import os
import re
import sys

raw_dir = sys.argv[1]
out_path = sys.argv[2]
pattern = re.compile(r"full_experiment_(JSON_BOTH|OPA_BOTH_MATRIX|OPA_DB_ONLY|OPA_BLOCKCHAIN_ONLY|FINAL_VERIFY_[0-9_]+)_[0-9]{8}_[0-9]{6}\.json$")

files = []
for name in os.listdir(raw_dir):
    if pattern.match(name):
        files.append(name)

files.sort(key=lambda n: os.path.getmtime(os.path.join(raw_dir, n)))

summary = {}
for name in files:
    p = os.path.join(raw_dir, name)
    try:
        with open(p, "r", encoding="utf-8") as f:
            data = json.load(f)
        s = data.get("experiment1_client_latency", {}).get("afterWarmupSummary", {})
        label = data.get("meta", {}).get("label", name)
        if s:
            summary[name] = {
                "label": label,
                "avg_ms": s.get("avg_ms"),
                "min_ms": s.get("min_ms"),
                "max_ms": s.get("max_ms"),
                "p95_ms": s.get("p95_ms"),
            }
    except Exception:
        continue

with open(out_path, "w", encoding="utf-8") as f:
    json.dump(summary, f, indent=2)
print(out_path)
PY
}

run_tamper_sequence() {
  echo "[4/5] Running automated tamper journey (ingest -> verify -> SQL tamper -> verify)..."
  # EXP-2 (explicit adversarial validation):
  #   Step A: ingest + baseline verify
  #   Step B: SQL UPDATE tamper -> verify (expect MISMATCH in real-chain mode)
  #   Step C: SQL DELETE tamper -> verify (expect VERIFIED_CHAIN_ONLY in real-chain mode)
  #
  # This block intentionally reproduces the integrity attack scenario end-to-end.
  local corr ts ingest_payload ingest_resp st_before st_after_update st_after_delete
  corr="journey-tamper-${TIMESTAMP}"
  ts="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

  ingest_payload="$(python3 - "$corr" "$ts" <<'PY'
import json,sys
corr = sys.argv[1]
ts = sys.argv[2]
payload = {
    "sourceSystem": "ehr",
    "actor": "admin",
    "targetResource": "patient-audit",
    "action": "READ",
    "decision": "ALLOW",
    "timestamp": ts,
    "correlationId": corr,
    "metadata": {"experiment": "tamper_journey", "run": "run_full_six_experiments.sh"},
}
print(json.dumps(payload))
PY
)"

  ingest_resp="$(curl -sS -X POST \
    -H "Content-Type: application/json" \
    -H "X-API-Key: $GOVERNANCE_API_KEY" \
    -d "$ingest_payload" \
    "${GOV_BASE_URL%/}/api/v1/audit/ingest")"

  st_before="$(verify_status_for_corr "$corr")"

  psql_exec "UPDATE external_audit_events SET actor='tampered' WHERE correlation_id='$corr';"
  st_after_update="$(verify_status_for_corr "$corr")"

  psql_exec "DELETE FROM external_audit_events WHERE correlation_id='$corr';"
  st_after_delete="$(verify_status_for_corr "$corr")"

  python3 - "$TAMPER_OUT" "$corr" "$st_before" "$st_after_update" "$st_after_delete" "$ingest_resp" <<'PY'
import json,sys
out_path, corr, st_before, st_after_update, st_after_delete, ingest_raw = sys.argv[1:]
try:
    ingest = json.loads(ingest_raw)
except Exception:
    ingest = {"raw": ingest_raw}

doc = {
    "correlationId": corr,
    "steps": [
        {"step": 1, "action": "POST /api/v1/audit/ingest", "result": ingest.get("verificationStatus", "ANCHORED/DB_ONLY")},
        {"step": 2, "action": "GET /api/v1/audit/verify/{correlationId}", "result": st_before},
        {"step": 3, "action": "SQL UPDATE external_audit_events ...", "result": st_after_update},
        {"step": 4, "action": "SQL DELETE external_audit_events ...", "result": st_after_delete},
    ],
    "notes": "Expected in real chain mode: VERIFIED -> MISMATCH -> VERIFIED_CHAIN_ONLY",
}
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(doc, f, indent=2)
print(out_path)
PY
}

print_outputs() {
  echo "[5/5] Complete."
  echo "Generated:"
  echo "  - Matrix run files: $RAW_DIR/full_experiment_*.json"
  echo "  - Matrix summary:   $MATRIX_SUMMARY_OUT"
  echo "  - Tamper journey:   $TAMPER_OUT"
  echo ""
  echo "Tip: archive these three output types for your defense."
}

main() {
  # Preflight: ensures all required local tools are installed before any experiment starts.
  require_cmd bash
  require_cmd curl
  require_cmd python3
  require_cmd psql
  mkdir -p "$RAW_DIR"

  # Health check before experiments: governance endpoint must be reachable.
  verify_health

  # Step 1: matrix (covers foundational runs for EXP-1/2/3/6).
  run_matrix

  # Health check after matrix restarts to ensure stable state for final capture.
  verify_health

  # Step 2: final capture (adds EXP-4 and EXP-5 in the same standardized JSON format).
  run_final_verify_capture

  # Step 3: build one summary file used in latency charts and presentation tables.
  build_matrix_summary

  # Step 4: explicit tamper attack and verification sequence for integrity claims.
  run_tamper_sequence

  # Step 5: print output paths to archive for defense/report evidence.
  print_outputs
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --explain)
      EXPLAIN_MODE=true
      shift
      ;;
    --explain-only)
      EXPLAIN_MODE=true
      EXPLAIN_ONLY=true
      shift
      ;;
    -h|--help)
      echo "Usage: $0 [--explain] [--explain-only]"
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      echo "Usage: $0 [--explain] [--explain-only]" >&2
      exit 1
      ;;
  esac
done

if [[ "$EXPLAIN_MODE" == "true" ]]; then
  print_explain_mapping
fi

if [[ "$EXPLAIN_ONLY" == "true" ]]; then
  exit 0
fi

main