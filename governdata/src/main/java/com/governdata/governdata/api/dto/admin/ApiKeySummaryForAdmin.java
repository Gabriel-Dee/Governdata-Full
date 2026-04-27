package com.governdata.governdata.api.dto.admin;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;

/** Non-secret API key metadata for platform operators. */
@Value
@Builder
public class ApiKeySummaryForAdmin {
    Long keyId;
    String name;
    String keyPrefix;
    boolean active;
    Instant expiresAt;
    Instant lastUsedAt;
    Instant createdAt;
}
