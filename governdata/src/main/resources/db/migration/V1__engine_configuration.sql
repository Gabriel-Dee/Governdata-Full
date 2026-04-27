CREATE TABLE engine_configuration (
    id BIGSERIAL PRIMARY KEY,
    engine_type VARCHAR(32) NOT NULL UNIQUE,
    enabled BOOLEAN NOT NULL DEFAULT true,
    config_json JSONB,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
