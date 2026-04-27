package com.governdata.governdata.api.dto.admin;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;

@Value
@Builder
public class TenantSummaryResponse {
    Long tenantId;
    String tenantKey;
    String displayName;
    boolean active;
    String primaryContactEmail;
    String primaryContactName;
    String primaryContactTitle;
    Instant createdAt;
    long activeApiKeyCount;
}
