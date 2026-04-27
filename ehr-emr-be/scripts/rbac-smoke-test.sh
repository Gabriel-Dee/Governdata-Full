#!/usr/bin/env bash
# RBAC smoke: login each demo user and hit key endpoints; print HTTP status + expectation.
# Requires a running API (default http://localhost:8080/api/v1).
# After code changes to SecurityConfig, restart the app so Bearer auth applies to all /api/v1/** routes.
#
# Optional: RBAC_SKIP_IMPORT=1 to skip EMR CSV import (can be slow when ehr.import.emr-max-rows=0).
set -euo pipefail
BASE="${BASE_URL:-http://localhost:8080/api/v1}"
RBAC_SKIP_IMPORT="${RBAC_SKIP_IMPORT:-0}"
# Unique MRN each run (duplicate MRN previously surfaced as a misleading 401 from the error path)
RUN_ID="${RUN_ID:-$(date +%s)-$RANDOM}"

code() { curl -sS -o /dev/null -w "%{http_code}" "$@"; }
json() { curl -sS "$@"; }

login_token() {
  local user="$1" pass="$2"
  json -X POST "$BASE/auth/login" -H "Content-Type: application/json" \
    -d "{\"username\":\"$user\",\"password\":\"$pass\"}" | python3 -c "import sys,json; print(json.load(sys.stdin).get('accessToken',''))" 2>/dev/null || echo ""
}

first_patient_id() {
  # Spring Data page JSON: content[].id
  python3 -c "import sys,json; d=json.load(sys.stdin); c=d.get('content') or []; print(c[0]['id'] if c else '')" 2>/dev/null || echo ""
}

expect_line() {
  local name="$1" got="$2" want="$3"
  local ok="OK"
  [[ "$got" == "$want" ]] || ok="FAIL"
  printf "  %-42s %s  (want %s) %s\n" "$name" "$got" "$want" "$ok"
}

echo "=== RBAC smoke against $BASE ==="
echo

USERS=(admin:admin123! clinician1:clinician123! nurse1:nurse123! researcher1:researcher123! billing1:billing123!)

for cred in "${USERS[@]}"; do
  u="${cred%%:*}"
  p="${cred#*:}"
  echo "--- User: $u ---"
  tok=$(login_token "$u" "$p")
  if [[ -z "$tok" ]]; then
    echo "  LOGIN FAILED"
    echo
    continue
  fi
  H=(-H "Authorization: Bearer $tok" -H "Content-Type: application/json")

  case "$u" in
    admin)
      E_INFO=200 E_LIST=200 E_GET=200 E_POST=201 E_AUDIT=200 E_IMPORT=200
      ;;
    clinician1)
      E_INFO=200 E_LIST=200 E_GET=200 E_POST=201 E_AUDIT=403 E_IMPORT=403
      ;;
    nurse1)
      E_INFO=200 E_LIST=200 E_GET=200 E_POST=403 E_AUDIT=403 E_IMPORT=403
      ;;
    researcher1)
      E_INFO=200 E_LIST=200 E_GET=200 E_POST=403 E_AUDIT=403 E_IMPORT=403
      ;;
    billing1)
      E_INFO=200 E_LIST=200 E_GET=403 E_POST=403 E_AUDIT=403 E_IMPORT=403
      ;;
  esac

  c_info=$(code "${H[@]}" "$BASE/info")
  expect_line "GET /info" "$c_info" "$E_INFO"

  list_body=$(json "${H[@]}" "$BASE/patients?page=0&size=5")
  c_list=$(code "${H[@]}" "$BASE/patients?page=0&size=5")
  expect_line "GET /patients (list)" "$c_list" "$E_LIST"

  pid=$(echo "$list_body" | first_patient_id)
  if [[ -n "$pid" ]]; then
    c_get=$(code "${H[@]}" "$BASE/patients/$pid")
    expect_line "GET /patients/{id} (from list)" "$c_get" "$E_GET"
  else
    echo "  GET /patients/{id}                         SKIP  (no patients in DB — run Flyway seed or EMR import)"
  fi

  c_post=$(code "${H[@]}" -X POST "$BASE/patients" -d '{"mrn":"RBAC-SMOKE-'"$u"'-'"$RUN_ID"'","firstName":"Smoke","lastName":"Test","dob":"1999-01-01"}')
  expect_line "POST /patients" "$c_post" "$E_POST"

  c_audit=$(code "${H[@]}" "$BASE/admin/audit-events?page=0&size=1")
  expect_line "GET /admin/audit-events" "$c_audit" "$E_AUDIT"

  if [[ "$RBAC_SKIP_IMPORT" == "1" ]]; then
    echo "  POST /import/healthcare-emr-data           SKIP  (RBAC_SKIP_IMPORT=1)"
  else
    c_imp=$(code "${H[@]}" -X POST "$BASE/admin/import/healthcare-emr-data?replace=false")
    expect_line "POST /import/healthcare-emr-data" "$c_imp" "$E_IMPORT"
  fi

  echo
done

echo "=== Done ==="
