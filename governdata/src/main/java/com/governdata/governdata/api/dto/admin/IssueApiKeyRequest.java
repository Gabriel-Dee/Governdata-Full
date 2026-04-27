package com.governdata.governdata.api.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.Instant;

@Data
public class IssueApiKeyRequest {
    @NotNull
    private Long tenantId;
    @NotBlank
    private String name;
    private Instant expiresAt;
}
