package com.governdata.governdata.persistence.repository;

import com.governdata.governdata.persistence.entity.ApiKeyEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ApiKeyRepository extends JpaRepository<ApiKeyEntity, Long> {
    Optional<ApiKeyEntity> findByKeyHashAndActiveTrue(String keyHash);

    long countByTenantIdAndActiveTrue(Long tenantId);

    List<ApiKeyEntity> findByTenantIdOrderByIdAsc(Long tenantId);

    Optional<ApiKeyEntity> findByIdAndTenantId(Long id, Long tenantId);
}
