package com.governdata.governdata.persistence.repository;

import com.governdata.governdata.persistence.entity.ExternalAuditEventEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ExternalAuditEventRepository extends JpaRepository<ExternalAuditEventEntity, Long> {

    Optional<ExternalAuditEventEntity> findByCorrelationId(String correlationId);

    Optional<ExternalAuditEventEntity> findByCorrelationIdAndTenantId(String correlationId, Long tenantId);
}
