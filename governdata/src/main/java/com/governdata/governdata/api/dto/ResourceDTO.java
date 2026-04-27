package com.governdata.governdata.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResourceDTO {

    @NotBlank(message = "resource.type is required")
    private String type;

    @NotBlank(message = "resource.resourceId is required")
    private String resourceId;
}
