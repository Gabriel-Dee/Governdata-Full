package com.governdata.ehr_emr_be.governance;

import java.util.UUID;

/**
 * Minimal request for future revoke-access integration with governance.
 */
public record RevokeRequest(
        UUID userId,
        UUID patientId,
        String resourceType
) {}
