package com.governdata.governdata.persistence.repository;

import com.governdata.governdata.persistence.entity.EngineConfigurationEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EngineConfigurationRepository extends JpaRepository<EngineConfigurationEntity, Long> {

    Optional<EngineConfigurationEntity> findByEngineType(String engineType);

    List<EngineConfigurationEntity> findByEnabledTrue();
}
