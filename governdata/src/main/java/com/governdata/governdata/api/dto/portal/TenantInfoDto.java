package com.governdata.governdata.api.dto.portal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenantInfoDto {
    private Long tenantId;
    private String tenantKey;
    private String displayName;
}
