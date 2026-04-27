package com.governdata.governdata.api.dto.portal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.Instant;

@Data
public class CreatePortalApiKeyRequest {
    @NotBlank
    @Size(max = 128)
    private String name;

    private Instant expiresAt;
}
