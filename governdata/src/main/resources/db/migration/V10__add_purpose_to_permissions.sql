-- Optional purpose on permissions: NULL = no purpose check; non-NULL = request must have context.purpose equal to this value (e.g. TREATMENT, BILLING for HIPAA-style).
ALTER TABLE permissions ADD COLUMN purpose VARCHAR(64) NULL;
