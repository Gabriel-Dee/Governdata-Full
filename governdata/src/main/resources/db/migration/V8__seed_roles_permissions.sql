INSERT INTO roles (name, description) VALUES
    ('Doctor', 'Physician with full clinical access'),
    ('Nurse', 'Nursing staff with delegated access'),
    ('Admin', 'Administrative role')
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (resource_type, action, description) VALUES
    ('PatientRecord', 'READ', 'Read patient records'),
    ('PatientRecord', 'WRITE', 'Create or update patient records'),
    ('PatientRecord', 'DELETE', 'Delete patient records')
ON CONFLICT (resource_type, action) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'Doctor' AND p.resource_type = 'PatientRecord' AND p.action IN ('READ', 'WRITE')
UNION ALL
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'Nurse' AND p.resource_type = 'PatientRecord' AND p.action = 'READ'
UNION ALL
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'Admin' AND p.resource_type = 'PatientRecord' AND p.action IN ('READ', 'WRITE', 'DELETE')
ON CONFLICT (role_id, permission_id) DO NOTHING;
