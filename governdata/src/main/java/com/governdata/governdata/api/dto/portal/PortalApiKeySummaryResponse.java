package com.governdata.governdata.api.dto.portal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PortalApiKeySummaryResponse {
    private Long keyId;
    private String name;
    private String keyPrefix;
    private boolean active;
    private Instant expiresAt;
    private Instant lastUsedAt;
    private Instant createdAt;
}
