#!/usr/bin/env bash
# Local one-shot: login as admin and POST healthcare-emr-data?replace=true
# WARNING: Full CSV (~51k rows) with ehr.import.emr-max-rows=0 can take many minutes.
set -euo pipefail
BASE="${BASE_URL:-http://localhost:8080/api/v1}"

echo "Logging in as admin..."
TOK=$(curl -sS -X POST "$BASE/auth/login" -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123!"}' | python3 -c "import sys,json; print(json.load(sys.stdin).get('accessToken',''))" 2>/dev/null || echo "")
if [[ -z "$TOK" ]]; then
  echo "FAIL: login"
  exit 1
fi

echo "GET import config..."
curl -sS -H "Authorization: Bearer $TOK" "$BASE/admin/import/healthcare-emr-config" | python3 -m json.tool || true

echo ""
echo "POST import replace=true (this may run a long time)..."
curl -sS -w "\nHTTP %{http_code}\n" -X POST \
  -H "Authorization: Bearer $TOK" \
  "$BASE/admin/import/healthcare-emr-data?replace=true"
echo "Done."
