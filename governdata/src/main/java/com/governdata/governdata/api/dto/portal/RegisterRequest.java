package com.governdata.governdata.api.dto.portal;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(min = 8, max = 128)
    private String password;

    /** Shown in the UI and stored as tenant display name. */
    @NotBlank
    @Size(max = 255)
    private String organizationDisplayName;

    /**
     * Optional stable slug (a-z, 0-9, hyphen). If omitted, derived from {@link #organizationDisplayName}.
     */
    @Size(max = 64)
    private String tenantKey;

    /** Optional personal display name for the portal account. */
    @Size(max = 255)
    private String displayName;
}
