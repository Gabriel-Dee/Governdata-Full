package com.governdata.governdata.api.dto.admin;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.List;

@Value
@Builder
public class TenantDetailResponse {
    Long tenantId;
    String tenantKey;
    String displayName;
    boolean active;
    String primaryContactEmail;
    String primaryContactName;
    String primaryContactTitle;
    Instant createdAt;
    Instant updatedAt;
    List<ApiKeySummaryForAdmin> apiKeys;
}
