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
public class SubjectDTO {

    @NotBlank(message = "subject.userId is required")
    private String userId;

    @NotBlank(message = "subject.role is required")
    private String role;

    private String department;
}
