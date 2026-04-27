package com.governdata.governdata.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthorizationRequest {

    @NotNull(message = "requestId is required")
    private UUID requestId;

    @NotNull(message = "subject is required")
    @Valid
    private SubjectDTO subject;

    @NotNull(message = "resource is required")
    @Valid
    private ResourceDTO resource;

    @NotBlank(message = "action is required")
    private String action;

    @Valid
    private ContextDTO context;

    @JsonProperty("requestId")
    public UUID getRequestId() {
        return requestId;
    }
}
