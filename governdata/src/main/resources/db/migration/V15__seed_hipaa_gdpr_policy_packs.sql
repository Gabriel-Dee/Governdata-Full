INSERT INTO policies (name, description, created_at)
SELECT 'healthcare-compliance', 'HIPAA/GDPR derived policy pack', now()
WHERE NOT EXISTS (SELECT 1 FROM policies WHERE name = 'healthcare-compliance');

INSERT INTO policy_versions (policy_id, version_tag, content, content_hash, active, created_at, scope_key, effective_from, effective_to, policy_metadata)
SELECT p.id,
       'v1-hipaa-gdpr',
       '{
         "defaultEffect": "DENY",
         "rules": [
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
       'f72a5df3f19fa5b8e2163f5d8cc6db66f9c508b5f2a1b4f47e52fbe8b8478d85',
       true,
       now(),
       'GLOBAL',
       now(),
       NULL,
       '{"policyFamily":"HEALTHCARE_COMPLIANCE","regulationTags":["HIPAA","GDPR"],"owner":"governance-team"}'::jsonb
FROM policies p
WHERE p.name = 'healthcare-compliance'
  AND NOT EXISTS (
      SELECT 1 FROM policy_versions pv
      WHERE pv.policy_id = p.id AND pv.version_tag = 'v1-hipaa-gdpr'
  );
