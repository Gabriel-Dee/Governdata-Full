package com.governdata.governdata.config;

import com.governdata.governdata.engines.GovernanceEngine;
import com.governdata.governdata.engines.EngineType;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Configuration
public class EngineConfig {

    @Bean
    public Map<EngineType, GovernanceEngine> engineRegistry(List<GovernanceEngine> engines) {
        return engines.stream()
                .collect(Collectors.toUnmodifiableMap(GovernanceEngine::getEngineType, Function.identity()));
    }
}
