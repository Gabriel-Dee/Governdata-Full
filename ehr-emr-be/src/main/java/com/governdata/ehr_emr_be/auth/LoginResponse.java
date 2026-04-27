package com.governdata.ehr_emr_be.auth;

import java.util.List;
import java.util.UUID;

public record LoginResponse(
        String accessToken,
        String tokenType,
        long expiresInSeconds,
        UUID userId,
        String username,
        List<String> roles,
        List<String> permissions
) {
}
