package com.governdata.governdata.api.dto.compliance;

public enum ComplianceOverallStatus {
    /** Every automated rule in scope has PASS */
    ALL_PASS,
    /** At least one automated FAIL */
    FAIL,
    /** No FAIL but at least one UNKNOWN */
    PARTIAL,
    /** No automated rules in selected frameworks */
    NO_AUTOMATED_RULES
}
