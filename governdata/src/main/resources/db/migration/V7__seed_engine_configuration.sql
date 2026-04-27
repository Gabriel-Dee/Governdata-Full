INSERT INTO engine_configuration (engine_type, enabled, config_json, updated_at)
VALUES
    ('RULE', true, NULL, now()),
    ('POLICY_CODE', true, NULL, now()),
    ('BLOCKCHAIN', false, '{}', now())
ON CONFLICT (engine_type) DO NOTHING;
