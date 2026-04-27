package com.governdata.governdata.api.dto.benchmark;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BenchmarkResponse {
    private String runtime;
    private int iterations;
    private int totalRequests;
    private long totalEvaluations;
    private long allowCount;
    private long denyCount;
    private double averageLatencyMs;
    private long p95LatencyMs;
}
