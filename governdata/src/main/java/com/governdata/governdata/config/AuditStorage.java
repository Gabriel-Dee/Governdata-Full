package com.governdata.governdata.config;

/**
 * Where audit records are stored (audit integrity axis).
 * DB_ONLY = central or version-bound DB only; BOTH = DB and blockchain; BLOCKCHAIN_ONLY = on-chain only.
 */
public enum AuditStorage {
    DB_ONLY,
    BLOCKCHAIN_ONLY,
    BOTH
}
