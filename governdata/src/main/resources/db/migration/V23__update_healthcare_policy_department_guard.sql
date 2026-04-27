-- Tighten healthcare-compliance policy to deny cross-department reads explicitly.
-- Keep prior version for traceability, activate v2 for runtime evaluation.

UPDATE policy_versions
SET active = false
WHERE policy_id = (SELECT id FROM policies WHERE name = 'healthcare-compliance')
  AND active = true
  AND scope_key = 'GLOBAL';

INSERT INTO policy_versions (
    policy_id,
    version_tag,
    content,
    content_hash,
    active,
    created_at,
    scope_key,
    effective_from,
    effective_to,
    policy_metadata
)
SELECT p.id,
       'v2-hipaa-gdpr-department-guard',
       '{
         "defaultEffect": "DENY",
         "rules": [
           {
             "priority": 220,
             "effect": "DENY",
             "role": "Doctor",
             "department": "Radiology",
             "resourceType": "PatientRecord",
             "action": "READ",
             "purpose": "TREATMENT",
             "reason": "Cross-department access denied by policy"
           },
           {
             "priority": 200,
             "effect": "ALLOW",
             "role": "Doctor",
             "resourceType": "PatientRecord",
             "action": "READ",
             "purpose": "TREATMENT",
             "reason": "HIPAA treatment use allowed",
             "legalBasis": "HIPAA_TREATMENT"
           },
           {
             "priority": 180,
             "effect": "DENY",
             "role": "Doctor",
             "resourceType": "PatientRecord",
             "action": "READ",
             "purpose": "RESEARCH",
             "reason": "Research requires de-identification and explicit legal basis"
           },
           {
             "priority": 160,
             "effect": "ALLOW",
             "resourceType": "PatientRecord",
             "action": "READ",
             "legalBasis": "GDPR_ART_6_1_E",
             "consentRequired": false,
             "region": "EU",
             "reason": "GDPR lawful basis public-interest processing"
           },
           {
             "priority": 150,
             "effect": "ALLOW",
             "resourceType": "PatientRecord",
             "action": "READ",
             "legalBasis": "GDPR_CONSENT",
             "consentRequired": true,
             "region": "EU",
             "reason": "GDPR consent-based processing"
           },
           {
             "priority": 140,
             "effect": "ALLOW",
             "resourceType": "PatientRecord",
             "action": "READ",
             "emergencyOnly": true,
             "reason": "Break-glass emergency access"
           }
         ]
       }',
       '5b9f3f58fefdc5d21f8e321d8878d3f13f4f6a4c56f05b962f2ef8503f42720c',
       true,
       now(),
       'GLOBAL',
       now(),
       NULL,
       '{"policyFamily":"HEALTHCARE_COMPLIANCE","regulationTags":["HIPAA","GDPR"],"owner":"governance-team","notes":"Adds explicit cross-department deny guard"}'::jsonb
FROM policies p
WHERE p.name = 'healthcare-compliance'
  AND NOT EXISTS (
      SELECT 1
      FROM policy_versions pv
      WHERE pv.policy_id = p.id
        AND pv.version_tag = 'v2-hipaa-gdpr-department-guard'
  );
