#!/usr/bin/env bash
# Full experiment matrix: restart governance per configuration and run full_experiment_run.py
# Prerequisites: PostgreSQL (governdata), Fabric + chaincode, Colima/Docker, OPA :8181 for OPA runs.
#
# This script is used by run_full_six_experiments.sh and maps to experiments as follows:
# - EXP-1 (Engine Comparison): JSON_BOTH vs OPA_BOTH_MATRIX
# - EXP-2 (DB vs Blockchain): OPA_DB_ONLY vs OPA_BLOCKCHAIN_ONLY
# - EXP-3 (Hybrid Model): JSON_BOTH and OPA_BOTH_MATRIX (BOTH mode)
# - EXP-6 (Latency Overhead): all four labels below are used in matrix summaries
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXPERIMENT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
GOV_ROOT="$(cd "$EXPERIMENT_ROOT/../governdata" && pwd)"
API_KEY="${GOVERNANCE_API_KEY:-gdk_tfNTWMEh-hmtOJ9jHQuj2UNIGYkAJsKimNUK3rJMVJE}"

FABRIC_PROFILE="${FABRIC_CONNECTION_PROFILE:-$GOV_ROOT/fabric/connection-org1-rich.json}"
WALLET="${FABRIC_WALLET_PATH:-$GOV_ROOT/fabric/wallet}"
IDENTITY="${FABRIC_IDENTITY_LABEL:-org1-admin}"

MVN="$GOV_ROOT/mvnw"

kill_gov() {
  lsof -ti :8080 2>/dev/null | xargs kill -9 2>/dev/null || true
  sleep 2
}

wait_gov() {
  local n=0
  while ! curl -sf "http://localhost:8080/actuator/health" >/dev/null 2>&1; do
    n=$((n+1))
    if [[ $n -gt 90 ]]; then
      echo "Timeout waiting for governance on :8080"
      exit 1
    fi
    sleep 2
  done
  echo "Governance UP"
}

# Args: label, then env key=value pairs for spring process
start_gov() {
  local label="$1"
  shift
  kill_gov
  (
    cd "$GOV_ROOT"
    export SERVER_PORT=8080
    export FABRIC_CONNECTION_PROFILE="$FABRIC_PROFILE"
    export FABRIC_WALLET_PATH="$WALLET"
    export FABRIC_IDENTITY_LABEL="$IDENTITY"
    export FABRIC_CHANNEL_NAME="${FABRIC_CHANNEL_NAME:-mychannel}"
    export FABRIC_CHAINCODE_NAME="${FABRIC_CHAINCODE_NAME:-governance}"
    export GOVERNANCE_BLOCKCHAIN_STUB=false
    while [[ $# -gt 0 ]]; do
      export "$1"
      shift
    done
    exec "$MVN" -q spring-boot:run
  ) &
  echo "Starting governance: $label (background)"
  wait_gov
}

run_py() {
  local lab="$1"
  python3 "$SCRIPT_DIR/full_experiment_run.py" --label "$lab" --api-key "$API_KEY"
}

echo "=== JSON runtime + BOTH audit + real Fabric ==="
# EXP-1 / EXP-3 / EXP-6
# Baseline JSON policy runtime with hybrid (DB + blockchain) audit path.
start_gov "JSON_BOTH" \
  "GOVERNANCE_POLICY_RUNTIME=JSON" \
  "GOVERNANCE_AUDIT_STORAGE=BOTH"
run_py "JSON_BOTH"

echo "=== OPA runtime + BOTH audit + real Fabric ==="
# EXP-1 / EXP-3 / EXP-6
# OPA policy runtime with same hybrid path for apples-to-apples comparison.
start_gov "OPA_BOTH" \
  "GOVERNANCE_POLICY_RUNTIME=OPA" \
  "GOVERNANCE_POLICY_OPA_URL=http://localhost:8181/v1/data/healthcare/authz/result" \
  "GOVERNANCE_POLICY_OPA_FAIL_OPEN=false" \
  "GOVERNANCE_POLICY_OPA_FALLBACK_JSON_ON_ERROR=false" \
  "GOVERNANCE_AUDIT_STORAGE=BOTH"
run_py "OPA_BOTH_MATRIX"

echo "=== OPA + DB_ONLY ==="
# EXP-2 / EXP-6
# Isolates centralized database-only audit behavior and low-latency path.
start_gov "OPA_DB_ONLY" \
  "GOVERNANCE_POLICY_RUNTIME=OPA" \
  "GOVERNANCE_POLICY_OPA_URL=http://localhost:8181/v1/data/healthcare/authz/result" \
  "GOVERNANCE_POLICY_OPA_FAIL_OPEN=false" \
  "GOVERNANCE_POLICY_OPA_FALLBACK_JSON_ON_ERROR=false" \
  "GOVERNANCE_AUDIT_STORAGE=DB_ONLY"
run_py "OPA_DB_ONLY"

echo "=== OPA + BLOCKCHAIN_ONLY ==="
# EXP-2 / EXP-6
# Isolates blockchain-only audit behavior for integrity and latency comparison.
start_gov "OPA_BLOCKCHAIN_ONLY" \
  "GOVERNANCE_POLICY_RUNTIME=OPA" \
  "GOVERNANCE_POLICY_OPA_URL=http://localhost:8181/v1/data/healthcare/authz/result" \
  "GOVERNANCE_POLICY_OPA_FAIL_OPEN=false" \
  "GOVERNANCE_POLICY_OPA_FALLBACK_JSON_ON_ERROR=false" \
  "GOVERNANCE_AUDIT_STORAGE=BLOCKCHAIN_ONLY"
run_py "OPA_BLOCKCHAIN_ONLY"

echo "=== Restore default: OPA + BOTH (for interactive dev) ==="
# Restore mode used by follow-up capture steps (EXP-4 and EXP-5 in orchestrator script).
start_gov "OPA_BOTH_RESTORE" \
  "GOVERNANCE_POLICY_RUNTIME=OPA" \
  "GOVERNANCE_POLICY_OPA_URL=http://localhost:8181/v1/data/healthcare/authz/result" \
  "GOVERNANCE_POLICY_OPA_FAIL_OPEN=false" \
  "GOVERNANCE_POLICY_OPA_FALLBACK_JSON_ON_ERROR=false" \
  "GOVERNANCE_AUDIT_STORAGE=BOTH"

echo "Matrix complete. Governance left running (OPA + BOTH)."
echo "Tamper test (manual): see EXPERIMENT_JOURNEY.md psql section."
