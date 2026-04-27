package com.governdata.governdata.api.dto.admin;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateTenantRequest {
    @NotBlank
    private String tenantKey;
    @NotBlank
    private String displayName;
    /** Optional: e.g. hospital IT / security owner email for your records. */
    private String primaryContactEmail;
    /** Optional: name of the person representing the org (e.g. integration lead). */
    private String primaryContactName;
    /** Optional: job title of that person (e.g. Director of IT Security). */
    private String primaryContactTitle;
}
