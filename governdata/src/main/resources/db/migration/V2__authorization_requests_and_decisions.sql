CREATE TABLE authorization_requests (
    id BIGSERIAL PRIMARY KEY,
    request_id UUID NOT NULL UNIQUE,
    subject_user_id VARCHAR(255) NOT NULL,
    subject_role VARCHAR(64) NOT NULL,
    subject_department VARCHAR(128),
    resource_type VARCHAR(64) NOT NULL,
    resource_id VARCHAR(255) NOT NULL,
    action VARCHAR(32) NOT NULL,
    context_purpose VARCHAR(64),
    context_location VARCHAR(128),
    context_timestamp TIMESTAMPTZ,
    received_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE decisions (
    id BIGSERIAL PRIMARY KEY,
    authorization_request_id BIGINT NOT NULL UNIQUE REFERENCES authorization_requests(id),
    engine_type VARCHAR(32) NOT NULL,
    decision VARCHAR(16) NOT NULL,
    reason_text TEXT,
    policy_version_id BIGINT NULL,
    evidence_id VARCHAR(255) NULL,
    latency_ms INTEGER NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_authorization_requests_request_id ON authorization_requests(request_id);
