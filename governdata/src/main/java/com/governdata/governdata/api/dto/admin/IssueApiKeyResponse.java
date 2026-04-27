package com.governdata.governdata.api.dto.admin;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class IssueApiKeyResponse {
    private Long tenantId;
    private String tenantKey;
    private String name;
    /** Plaintext key returned once at issuance. */
    private String apiKey;
    private String keyPrefix;
    private Instant expiresAt;
}
