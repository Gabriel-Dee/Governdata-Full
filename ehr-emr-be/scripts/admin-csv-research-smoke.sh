#!/usr/bin/env bash
# Smoke-test admin JWT against main APIs after CSV import (or empty DB).
# Does NOT run full CSV import by default (can take minutes). Set RUN_EMR_IMPORT=1 to call import.
set -euo pipefail
BASE="${BASE_URL:-http://localhost:8080/api/v1}"
RUN_EMR_IMPORT="${RUN_EMR_IMPORT:-0}"

json() { curl -sS "$@"; }
code() { curl -sS -o /dev/null -w "%{http_code}" "$@"; }

echo "=== Admin API smoke: $BASE ==="
TOK=$(json -X POST "$BASE/auth/login" -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123!"}' | python3 -c "import sys,json; print(json.load(sys.stdin).get('accessToken',''))" 2>/dev/null || echo "")
if [[ -z "$TOK" ]]; then
  echo "FAIL: login"
  exit 1
fi
H=(-H "Authorization: Bearer $TOK" -H "Content-Type: application/json")

echo "GET /actuator/health -> $(curl -sS -o /dev/null -w '%{http_code}' http://localhost:8080/actuator/health)"
echo "GET /info -> $(code "${H[@]}" "$BASE/info")"
echo "GET /patients?page=0&size=3 -> $(code "${H[@]}" "$BASE/patients?page=0&size=3")"
PID=$(json "${H[@]}" "$BASE/patients?page=0&size=1" | python3 -c "import sys,json; d=json.load(sys.stdin); c=d.get('content')or[]; print(c[0]['id'] if c else '')" 2>/dev/null || echo "")
if [[ -n "$PID" ]]; then
  echo "GET /patients/{id} -> $(code "${H[@]}" "$BASE/patients/$PID")"
  echo "GET .../encounters -> $(code "${H[@]}" "$BASE/patients/$PID/encounters?page=0&size=2")"
  echo "GET .../diagnoses -> $(code "${H[@]}" "$BASE/patients/$PID/diagnoses?page=0&size=2")"
  echo "GET .../medications -> $(code "${H[@]}" "$BASE/patients/$PID/medications?page=0&size=2")"
else
  echo "SKIP detail/child routes (no patients — import CSV first)"
fi
echo "GET /admin/audit-events -> $(code "${H[@]}" "$BASE/admin/audit-events?page=0&size=1")"

if [[ "$RUN_EMR_IMPORT" == "1" ]]; then
  echo "POST /admin/import/healthcare-emr-data?replace=false -> $(code "${H[@]}" -X POST "$BASE/admin/import/healthcare-emr-data?replace=false")"
else
  echo "SKIP EMR import (set RUN_EMR_IMPORT=1 to POST merge import; use replace=true in docs for full reload)"
fi

echo "=== Done ==="
