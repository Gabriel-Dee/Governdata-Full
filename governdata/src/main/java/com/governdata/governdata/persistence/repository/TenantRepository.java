package com.governdata.governdata.persistence.repository;

import com.governdata.governdata.persistence.entity.TenantEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TenantRepository extends JpaRepository<TenantEntity, Long> {
    Optional<TenantEntity> findByTenantKey(String tenantKey);
}
