CREATE TABLE audit_event (
    id UUID PRIMARY KEY,
    occurred_at TIMESTAMP WITH TIME ZONE NOT NULL,
    actor_user_id UUID NOT NULL,
    action VARCHAR(32) NOT NULL,
    resource_type VARCHAR(64) NOT NULL,
    resource_id UUID,
    patient_id UUID,
    before_state_hash VARCHAR(64),
    after_state_hash VARCHAR(64)
);

CREATE INDEX idx_audit_event_occurred_at ON audit_event (occurred_at DESC);
CREATE INDEX idx_audit_event_actor ON audit_event (actor_user_id);
CREATE INDEX idx_audit_event_resource ON audit_event (resource_type, resource_id);
CREATE INDEX idx_audit_event_patient ON audit_event (patient_id);

INSERT INTO permissions (id, code, resource_type, action, description) VALUES
('20000000-0000-0000-0000-000000000013', 'audit.read', 'audit', 'read', 'Read local structured audit trail')
ON CONFLICT (code) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT '10000000-0000-0000-0000-000000000001', id FROM permissions WHERE code = 'audit.read'
ON CONFLICT (role_id, permission_id) DO NOTHING;
