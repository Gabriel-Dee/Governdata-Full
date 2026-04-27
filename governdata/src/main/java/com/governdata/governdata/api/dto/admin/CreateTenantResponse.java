package com.governdata.governdata.api.dto.admin;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CreateTenantResponse {
    private Long tenantId;
    private String tenantKey;
    private String displayName;
    private String primaryContactEmail;
    private String primaryContactName;
    private String primaryContactTitle;
}
