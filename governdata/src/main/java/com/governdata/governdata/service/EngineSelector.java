package com.governdata.governdata.service;

import com.governdata.governdata.engines.EngineType;
import com.governdata.governdata.engines.GovernanceEngine;
import com.governdata.governdata.persistence.entity.EngineConfigurationEntity;
import com.governdata.governdata.persistence.repository.EngineConfigurationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EngineSelector {

    private final Map<EngineType, GovernanceEngine> engineRegistry;
    private final EngineConfigurationRepository engineConfigurationRepository;

    @Value("${governance.default-engine:POLICY_CODE}")
    private String defaultEngineType;

    public GovernanceEngine selectEngine() {
        EngineType preferred = parseEngineType(defaultEngineType);
        if (preferred != null) {
            EngineConfigurationEntity config = engineConfigurationRepository.findByEngineType(preferred.name()).orElse(null);
            if (config != null && Boolean.TRUE.equals(config.getEnabled())) {
                GovernanceEngine engine = engineRegistry.get(preferred);
                if (engine != null) {
                    return engine;
                }
            }
        }
        List<EngineConfigurationEntity> enabled = engineConfigurationRepository.findByEnabledTrue();
        for (EngineConfigurationEntity c : enabled) {
            EngineType type = parseEngineType(c.getEngineType());
            if (type != null) {
                GovernanceEngine engine = engineRegistry.get(type);
                if (engine != null) {
                    log.debug("Using first enabled engine: {}", type);
                    return engine;
                }
            }
        }
        throw new IllegalStateException("No enabled governance engine available");
    }

    private static EngineType parseEngineType(String value) {
        if (value == null || value.isBlank()) return null;
        String normalized = value.trim().toUpperCase();
        if ("BLOCKCHAIN".equals(normalized)) {
            return null;
        }
        try {
            return EngineType.valueOf(normalized);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
