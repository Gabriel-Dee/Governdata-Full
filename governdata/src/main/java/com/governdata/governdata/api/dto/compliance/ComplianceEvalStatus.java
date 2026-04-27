package com.governdata.governdata.api.dto.compliance;

public enum ComplianceEvalStatus {
    /** Automated rule and submitted evidence satisfies it */
    PASS,
    /** Automated rule and evidence explicitly false or contradictory */
    FAIL,
    /** Automated rule but no evidence key submitted */
    UNKNOWN,
    /** Catalog-only rule; not evaluated from evidence map */
    INFORMATIONAL
}
