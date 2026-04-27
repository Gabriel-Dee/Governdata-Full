-- Run once if Flyway 11 fails with:
--   No enum constant org.flywaydb.core.api.CoreMigrationType.VERSIONED
-- Older Flyway versions stored type = 'VERSIONED'; Flyway 11+ expects 'SQL' for versioned SQL migrations.

UPDATE flyway_schema_history SET type = 'SQL' WHERE type IN ('VERSIONED', 'versioned');

-- If you still see checksum mismatch errors, prefer: ./mvnw flyway:repair (updates history to match current files).
