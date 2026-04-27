#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:8080}"
ENV_FILE="${ENV_FILE:-.env}"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

REQUEST_ID_AUTH="${REQUEST_ID_AUTH:-$(uuidgen | tr '[:upper:]' '[:lower:]')}"
REQUEST_ID_BENCH="${REQUEST_ID_BENCH:-$(uuidgen | tr '[:upper:]' '[:lower:]')}"
CORR_ID="${CORR_ID:-corr-$(date +%s)}"
TENANT_KEY="${TENANT_KEY:-smoke-tenant-$(date +%s)}"
TENANT_NAME="${TENANT_NAME:-Smoke Tenant}"
ADMIN_SECRET="${GOVERNANCE_ADMIN_SECRET:-}"
API_KEY="${GOVERNANCE_API_KEY:-${API_KEY:-}}"
SMOKE_EMAIL="${SMOKE_EMAIL:-smoke-$(date +%s)@example.invalid}"
SMOKE_PASSWORD="${SMOKE_PASSWORD:-Smoke-test-pass-8chars}"

failures=0

declare -a auth_header_args=()
if [[ -n "${API_KEY}" ]]; then
  auth_header_args=(-H "X-API-Key: ${API_KEY}")
fi

run_get() {
  local name="$1"
  local path="$2"
  local expected="${3:-200}"
  local response
  local code

  if [[ ${#auth_header_args[@]} -gt 0 ]]; then
    response="$(curl -sS -w '\n%{http_code}' "${auth_header_args[@]}" "$BASE_URL$path")"
  else
    response="$(curl -sS -w '\n%{http_code}' "$BASE_URL$path")"
  fi
  code="$(printf '%s' "$response" | awk 'END{print}')"
  body="$(printf '%s' "$response" | sed '$d')"

  echo "=== $name"
  echo "$body"
  echo "HTTP:$code"

  if [[ "$code" != "$expected" ]]; then
    failures=$((failures + 1))
    echo "FAIL: expected HTTP $expected"
  fi
  echo
}

run_post_json() {
  local name="$1"
  local path="$2"
  local payload="$3"
  local expected="${4:-200}"
  local response
  local code

  if [[ ${#auth_header_args[@]} -gt 0 ]]; then
    response="$(curl -sS -w '\n%{http_code}' \
      "${auth_header_args[@]}" \
      -H 'Content-Type: application/json' \
      -d "$payload" \
      "$BASE_URL$path")"
  else
    response="$(curl -sS -w '\n%{http_code}' \
      -H 'Content-Type: application/json' \
      -d "$payload" \
      "$BASE_URL$path")"
  fi
  code="$(printf '%s' "$response" | awk 'END{print}')"
  body="$(printf '%s' "$response" | sed '$d')"

  echo "=== $name"
  echo "$body"
  echo "HTTP:$code"

  if [[ "$code" != "$expected" ]]; then
    failures=$((failures + 1))
    echo "FAIL: expected HTTP $expected"
  fi
  echo
}

admin_post_json() {
  local path="$1"
  local payload="$2"
  curl -sS -X POST "$BASE_URL$path" \
    -H "X-Admin-Secret: ${ADMIN_SECRET}" \
    -H 'Content-Type: application/json' \
    -d "$payload"
}

AUTH_PAYLOAD="$(cat <<EOF
{"requestId":"$REQUEST_ID_AUTH","subject":{"userId":"doctor-1","role":"Doctor","department":"Cardiology"},"resource":{"type":"PatientRecord","resourceId":"patient-123"},"action":"READ","context":{"purpose":"treatment","location":"hospital","timestamp":"2026-03-26T00:00:00.000Z","attributes":{"legalBasis":"HIPAA","consentGranted":true,"region":"US"}}}
EOF
)"

INGEST_PAYLOAD="$(cat <<EOF
{"sourceSystem":"ehr","actor":"doctor-1","targetResource":"patient-123","action":"READ","decision":"ALLOW","timestamp":"2026-03-26T00:00:00Z","correlationId":"$CORR_ID","metadata":{"note":"ingest test"}}
EOF
)"

BENCH_PAYLOAD="$(cat <<EOF
{"iterations":1,"requests":[{"requestId":"$REQUEST_ID_BENCH","subject":{"userId":"doctor-2","role":"Doctor","department":"ICU"},"resource":{"type":"PatientRecord","resourceId":"patient-456"},"action":"READ","context":{"purpose":"treatment","timestamp":"2026-03-26T00:00:00.000Z","attributes":{"legalBasis":"HIPAA","consentGranted":true,"region":"US"}}}]}
EOF
)"

run_get "GET /actuator/health" "/actuator/health" 200

if [[ ${#auth_header_args[@]} -eq 0 ]]; then
  if [[ -n "${ADMIN_SECRET}" ]]; then
    create_tenant_payload="$(cat <<EOF
{"tenantKey":"$TENANT_KEY","displayName":"$TENANT_NAME"}
EOF
)"
    tenant_resp="$(admin_post_json "/api/v1/admin/tenants" "$create_tenant_payload")"
    tenant_id="$(printf '%s' "$tenant_resp" | sed -n 's/.*"tenantId":\([0-9][0-9]*\).*/\1/p')"
    if [[ -z "$tenant_id" ]]; then
      echo "FAIL: unable to create tenant. Response: $tenant_resp"
      exit 1
    fi
    echo "Created tenant: $TENANT_KEY (id=$tenant_id)"

    issue_key_payload="$(cat <<EOF
{"tenantId":$tenant_id,"name":"smoke-key"}
EOF
)"
    key_resp="$(admin_post_json "/api/v1/admin/api-keys" "$issue_key_payload")"
    API_KEY="$(printf '%s' "$key_resp" | sed -n 's/.*"apiKey":"\([^"]*\)".*/\1/p')"
    if [[ -z "$API_KEY" ]]; then
      echo "FAIL: unable to issue API key. Response: $key_resp"
      exit 1
    fi
    echo "Issued API key prefix: $(printf '%s' "$API_KEY" | cut -c1-12)..."
  else
    register_payload="$(cat <<EOF
{"email":"$SMOKE_EMAIL","password":"$SMOKE_PASSWORD","organizationDisplayName":"$TENANT_NAME","tenantKey":"$TENANT_KEY"}
EOF
)"
    reg_resp="$(curl -sS -X POST "$BASE_URL/api/v1/auth/register" \
      -H 'Content-Type: application/json' \
      -d "$register_payload")"
    PORTAL_JWT="$(printf '%s' "$reg_resp" | sed -n 's/.*"accessToken":"\([^"]*\)".*/\1/p')"
    if [[ -z "$PORTAL_JWT" ]]; then
      echo "FAIL: self-service register failed (need GOVERNANCE_ADMIN_SECRET or working /api/v1/auth/register). Response: $reg_resp"
      exit 1
    fi
    echo "Registered portal user: $SMOKE_EMAIL (tenant $TENANT_KEY)"

    key_resp="$(curl -sS -X POST "$BASE_URL/api/v1/portal/api-keys" \
      -H "Authorization: Bearer ${PORTAL_JWT}" \
      -H 'Content-Type: application/json' \
      -d '{"name":"smoke-key"}')"
    API_KEY="$(printf '%s' "$key_resp" | sed -n 's/.*"apiKey":"\([^"]*\)".*/\1/p')"
    if [[ -z "$API_KEY" ]]; then
      echo "FAIL: unable to issue API key via portal. Response: $key_resp"
      exit 1
    fi
    echo "Issued API key via portal prefix: $(printf '%s' "$API_KEY" | cut -c1-12)..."
  fi
  auth_header_args=(-H "X-API-Key: ${API_KEY}")
fi

run_get "GET /api/v1/metrics" "/api/v1/metrics" 200
run_get "GET /api/v1/compliance/catalog?framework=HIPAA" "/api/v1/compliance/catalog?framework=HIPAA" 200
COMPLIANCE_EVAL_PAYLOAD='{"frameworks":["HIPAA"],"evidence":{"hipaa_access_unique_user_id":true,"hipaa_audit_controls":false}}'
run_post_json "POST /api/v1/compliance/evaluate" "/api/v1/compliance/evaluate" "$COMPLIANCE_EVAL_PAYLOAD" 200
run_post_json "POST /api/v1/authorize" "/api/v1/authorize" "$AUTH_PAYLOAD" 200
run_get "GET /api/v1/audit/{requestId}" "/api/v1/audit/$REQUEST_ID_AUTH" 200
run_post_json "POST /api/v1/audit/ingest" "/api/v1/audit/ingest" "$INGEST_PAYLOAD" 200
run_get "GET /api/v1/audit/verify/{correlationId}" "/api/v1/audit/verify/$CORR_ID" 200
run_post_json "POST /api/v1/benchmark/policy-runtime" "/api/v1/benchmark/policy-runtime" "$BENCH_PAYLOAD" 200

if [[ "$failures" -gt 0 ]]; then
  echo "Smoke test completed with $failures failing endpoint(s)."
  exit 1
fi

echo "Smoke test passed: all endpoints returned expected HTTP status."
