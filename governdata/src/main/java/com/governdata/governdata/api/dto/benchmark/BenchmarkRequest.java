package com.governdata.governdata.api.dto.benchmark;

import com.governdata.governdata.api.dto.AuthorizationRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BenchmarkRequest {

    @NotEmpty
    @Valid
    private List<AuthorizationRequest> requests;

    /** Number of iterations over the request corpus. */
    @Min(1)
    @Builder.Default
    private int iterations = 1;
}
