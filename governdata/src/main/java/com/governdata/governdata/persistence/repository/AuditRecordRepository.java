package com.governdata.governdata.persistence.repository;

import com.governdata.governdata.persistence.entity.AuditRecordEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface AuditRecordRepository extends JpaRepository<AuditRecordEntity, Long> {

    @Query("SELECT ar FROM AuditRecordEntity ar " +
           "JOIN FETCH ar.authorizationRequest " +
           "JOIN FETCH ar.decisionRef " +
           "WHERE ar.requestId = :requestId AND ar.authorizationRequest.tenantId = :tenantId")
    Optional<AuditRecordEntity> findByRequestIdWithDetails(@Param("requestId") UUID requestId, @Param("tenantId") Long tenantId);

    default Optional<AuditRecordEntity> findByRequestId(UUID requestId, Long tenantId) {
        return findByRequestIdWithDetails(requestId, tenantId);
    }
}
