# Integration Profiles

## EHR/EMR Profile (HIPAA + GDPR)

Expected request mapping to `/api/v1/authorize`:
- `subject.role`: clinical role (Doctor, Nurse, etc.)
- `resource.type`: domain object (`patient`, `encounter`, `diagnosis`, `medication`)
- `action`: `READ`, `LIST`, `CREATE`, `UPDATE`, `DELETE`
- `context.purpose`: TREATMENT, PAYMENT, OPERATIONS, RESEARCH
- `context.attributes.legalBasis`: `HIPAA` or `GDPR`
- `context.attributes.consentGranted`: true/false
- `context.attributes.region`: `US` or `EU`
- `context.attributes.sourceSystem`: EHR identifier (`ehr-emr-be`)
- `context.attributes.tenantId`: tenant key (`ehremr`)

For external audit ingestion `/api/v1/audit/ingest`:
- `correlationId`: local `audit_event.id` from EHR
- `sourceSystem`: EHR name
- `actor`: user/service principal
- `targetResource`: `<resourceType>:<resourceId-or-global>`
- `action`, `decision`, `timestamp`
- `metadata`: `evaluationTraceId`, `policyVersion`, `runtimeUsed`, state hashes, legalBasis, region

## Generic Enterprise Profile (cross-domain)

Same API contract; domain-specific semantics map into:
- `resource.type`
- `action`
- `context.attributes` (tenant, geo, data-classification, legal basis)

## Compatibility Notes

- Governance service is technology-agnostic (any backend can call HTTP API).
- Policy runtime can be switched with `GOVERNANCE_POLICY_RUNTIME=JSON|OPA`.
- Audit integrity mode can be switched with `GOVERNANCE_AUDIT_STORAGE=DB_ONLY|BLOCKCHAIN_ONLY|BOTH`.
- EHR outbound calls must include `X-API-Key`.

## Header-driven overrides for experiments (EHR side)

When calling EHR endpoints, you can override policy context without redeploying:
- `X-Purpose-Of-Use` (e.g. `TREATMENT`, `RESEARCH`)
- `X-Legal-Basis` (`HIPAA`, `GDPR`)
- `X-Region` (`US`, `EU`)
- `X-Consent-Granted` (`true`, `false`)
- `X-Department`, `X-Location`

This allows controlled deny-path experiments such as:
- GDPR + `consentGranted=false` (expected deny)
- HIPAA + unsupported purpose
- cross-region mismatch with strict policy packs
