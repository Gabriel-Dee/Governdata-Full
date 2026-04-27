-- Default policy for POLICY_CODE engine (one active version with simple rules)
INSERT INTO policies (name, description, created_at)
SELECT 'default', 'Default MedGovX policy (role/resource/action rules)', now()
WHERE NOT EXISTS (SELECT 1 FROM policies WHERE name = 'default');

INSERT INTO policy_versions (policy_id, version_tag, content, content_hash, active, created_at)
SELECT p.id, 'v1',
    '{"rules":[{"effect":"ALLOW","role":"Doctor","resourceType":"PatientRecord","action":"READ"},{"effect":"ALLOW","role":"Doctor","resourceType":"PatientRecord","action":"WRITE"},{"effect":"ALLOW","role":"Nurse","resourceType":"PatientRecord","action":"READ"},{"effect":"ALLOW","role":"Admin","resourceType":"PatientRecord","action":"READ"},{"effect":"ALLOW","role":"Admin","resourceType":"PatientRecord","action":"WRITE"},{"effect":"ALLOW","role":"Admin","resourceType":"PatientRecord","action":"DELETE"}]}',
    'e4ffff82ae1896b1a45c16a4d31ec2c1dbb496afdf60877df5d816767b66e4f5',
    true,
    now()
FROM policies p
WHERE p.name = 'default'
  AND NOT EXISTS (SELECT 1 FROM policy_versions pv WHERE pv.policy_id = p.id AND pv.version_tag = 'v1');

-- Ensure only one active version per policy (deactivate others if any)
UPDATE policy_versions pv
SET active = false
FROM policies p
WHERE pv.policy_id = p.id AND p.name = 'default' AND pv.version_tag != 'v1';
