package com.governdata.governdata.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MetricsResponseDTO {

    /** Decision counts by engine type. */
    private Map<String, Long> decisionCountByEngine;

    /** Unauthorized (DENY) counts by engine type. */
    private Map<String, Long> denyCountByEngine;

    /** Latency statistics per engine (avg, min, max, p50, p95, p99 in ms). */
    private List<EngineLatencyStats> latencyByEngine;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EngineLatencyStats {
        private String engineType;
        private long totalDecisions;
        private long withLatency;
        private Double avgMs;
        private Integer minMs;
        private Integer maxMs;
        private Double p50Ms;
        private Double p95Ms;
        private Double p99Ms;
    }
}
