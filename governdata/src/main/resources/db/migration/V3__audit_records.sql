CREATE TABLE audit_records (
    id BIGSERIAL PRIMARY KEY,
    request_id UUID NOT NULL,
    authorization_request_id BIGINT NOT NULL REFERENCES authorization_requests(id),
    decision_id BIGINT NOT NULL REFERENCES decisions(id),
    engine_used VARCHAR(32) NOT NULL,
    policy_version_hash VARCHAR(64) NULL,
    decision VARCHAR(16) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_audit_records_request_id ON audit_records(request_id);
CREATE INDEX idx_audit_records_created_at ON audit_records(created_at);
