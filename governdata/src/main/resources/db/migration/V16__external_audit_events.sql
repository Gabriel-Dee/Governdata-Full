CREATE TABLE IF NOT EXISTS external_audit_events (
    id BIGSERIAL PRIMARY KEY,
    correlation_id VARCHAR(128) NOT NULL UNIQUE,
    source_system VARCHAR(128) NOT NULL,
    actor VARCHAR(255) NOT NULL,
    target_resource VARCHAR(255) NOT NULL,
    action VARCHAR(64) NOT NULL,
    decision VARCHAR(16) NOT NULL,
    occurred_at TIMESTAMPTZ NOT NULL,
    event_hash VARCHAR(64) NOT NULL,
    evidence_id VARCHAR(255),
    chain_network VARCHAR(64),
    anchor_timestamp TIMESTAMPTZ,
    verification_status VARCHAR(32) NOT NULL DEFAULT 'UNVERIFIED',
    metadata_json JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_external_audit_events_source_system ON external_audit_events(source_system);
CREATE INDEX IF NOT EXISTS idx_external_audit_events_occurred_at ON external_audit_events(occurred_at);
