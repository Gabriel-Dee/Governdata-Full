package com.governdata.ehr_emr_be.security;

import java.util.UUID;

/**
 * Identity of the caller for governance requests. Set from headers (X-User-Id, X-Purpose-Of-Use).
 * Governance is the authority for allow/deny; this only identifies who is making the request.
 */
public record CallerIdentity(UUID userId, String purposeOfUse) {

    public static final String DEFAULT_PURPOSE = "TREATMENT";

    public String purposeOfUseOrDefault() {
        return purposeOfUse != null && !purposeOfUse.isBlank() ? purposeOfUse : DEFAULT_PURPOSE;
    }
}
