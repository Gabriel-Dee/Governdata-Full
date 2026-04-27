package com.governdata.governdata.service;

import com.governdata.governdata.api.dto.MetricsResponseDTO;
import com.governdata.governdata.auth.TenantRequestContext;
import com.governdata.governdata.engines.EngineType;
import com.governdata.governdata.persistence.repository.DecisionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MetricsService {

    private static final Set<String> ENFORCEMENT_ENGINES = Arrays.stream(EngineType.values())
            .map(EngineType::name)
            .collect(Collectors.toUnmodifiableSet());

    private final DecisionRepository decisionRepository;

    @Transactional(readOnly = true)
    public MetricsResponseDTO getMetrics() {
        Long tenantId = TenantRequestContext.requireTenantId();
        Map<String, Long> decisionCountByEngine = new LinkedHashMap<>();
        Map<String, Long> denyCountByEngine = new LinkedHashMap<>();
        for (EngineType type : EngineType.values()) {
            String name = type.name();
            decisionCountByEngine.put(name, decisionRepository.countByEngineTypeForTenant(name, tenantId));
            denyCountByEngine.put(name, decisionRepository.countByEngineTypeAndDecisionForTenant(name, "DENY", tenantId));
        }

        List<MetricsResponseDTO.EngineLatencyStats> latencyByEngine = new ArrayList<>();
        for (DecisionRepository.LatencyStatsProjection row : decisionRepository.latencyStatsByEngineForTenant(tenantId)) {
            if (!ENFORCEMENT_ENGINES.contains(row.getEngineType())) {
                continue;
            }
            latencyByEngine.add(MetricsResponseDTO.EngineLatencyStats.builder()
                    .engineType(row.getEngineType())
                    .totalDecisions(row.getTotal())
                    .withLatency(row.getWithLatency())
                    .avgMs(row.getAvgMs())
                    .minMs(row.getMinMs())
                    .maxMs(row.getMaxMs())
                    .p50Ms(row.getP50Ms())
                    .p95Ms(row.getP95Ms())
                    .p99Ms(row.getP99Ms())
                    .build());
        }

        return MetricsResponseDTO.builder()
                .decisionCountByEngine(decisionCountByEngine)
                .denyCountByEngine(denyCountByEngine)
                .latencyByEngine(latencyByEngine)
                .build();
    }
}
