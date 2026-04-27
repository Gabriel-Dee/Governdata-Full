-- Final governance mode: policy enforcement only. Keep POLICY_CODE as sole enforcement engine.
DELETE FROM engine_configuration WHERE engine_type IN ('RULE', 'BLOCKCHAIN');

INSERT INTO engine_configuration (engine_type, enabled, config_json, updated_at)
VALUES ('POLICY_CODE', true, NULL, now())
ON CONFLICT (engine_type) DO UPDATE SET enabled = EXCLUDED.enabled, updated_at = now();
