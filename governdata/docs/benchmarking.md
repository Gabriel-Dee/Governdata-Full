# Runtime Benchmark Hook

Endpoint: `POST /api/v1/benchmark/policy-runtime`

## Purpose
- Run repeated authorization calls over the same request corpus.
- Compare policy runtime behavior under identical workload.
- Generate experiment evidence for:
  - JSON engine vs OPA engine latency/throughput
  - Unauthorized access handling consistency
  - policy-deny correctness under HIPAA/GDPR contexts

## Environment matrix

| Dimension | Values |
|---|---|
| `GOVERNANCE_POLICY_RUNTIME` | `JSON`, `OPA` |
| `GOVERNANCE_AUDIT_STORAGE` | `DB_ONLY`, `BOTH`, `BLOCKCHAIN_ONLY` |
| Request profile | HIPAA allow/deny, GDPR allow/deny |

Run every runtime/storage pair with the same benchmark payload and iteration count.

## Recommended execution sequence
1. Start governance with one runtime/storage combination.
2. Run benchmark request (`iterations >= 100` per profile for stable percentiles).
3. Capture response JSON and application logs.
4. Repeat with the next runtime/storage combination.
5. Keep EHR workload generator and request corpus unchanged between runs.

## Example benchmark payload (mixed allow/deny)

```json
{
  "iterations": 200,
  "requests": [
    {
      "requestId": "11111111-1111-4111-8111-111111111111",
      "subject": {"userId": "doctor-1", "role": "Doctor", "department": "Cardiology"},
      "resource": {"type": "patient", "resourceId": "patient-1"},
      "action": "READ",
      "context": {
        "purpose": "TREATMENT",
        "location": "hospital",
        "attributes": {"legalBasis": "HIPAA", "consentGranted": true, "region": "US", "tenantId": "ehremr"}
      }
    },
    {
      "requestId": "22222222-2222-4222-8222-222222222222",
      "subject": {"userId": "doctor-1", "role": "Doctor", "department": "Outpatient"},
      "resource": {"type": "patient", "resourceId": "patient-2"},
      "action": "READ",
      "context": {
        "purpose": "TREATMENT",
        "location": "clinic",
        "attributes": {"legalBasis": "GDPR", "consentGranted": false, "region": "EU", "tenantId": "ehremr"}
      }
    }
  ]
}
```

## Capture these metrics per run
- `averageLatencyMs`, `p95LatencyMs`, `p99LatencyMs` (if exposed)
- total allow and deny count
- request error count / timeout count
- governance audit ingest success rate
- audit verify success rate (`verificationStatus`)
- blockchain evidence coverage (`evidenceId` presence) when storage includes chain

## Suggested report table

| Runtime | Storage | Profile | Avg ms | P95 ms | Deny correctness | Verify pass rate | Notes |
|---|---|---|---:|---:|---:|---:|---|
| JSON | DB_ONLY | Mixed HIPAA/GDPR |  |  |  |  |  |
| JSON | BOTH | Mixed HIPAA/GDPR |  |  |  |  |  |
| OPA | DB_ONLY | Mixed HIPAA/GDPR |  |  |  |  |  |
| OPA | BOTH | Mixed HIPAA/GDPR |  |  |  |  |  |
