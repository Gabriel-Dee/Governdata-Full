package com.governdata.governdata.persistence.repository;

import com.governdata.governdata.persistence.entity.AuthorizationRequestEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AuthorizationRequestRepository extends JpaRepository<AuthorizationRequestEntity, Long> {

    Optional<AuthorizationRequestEntity> findByRequestId(UUID requestId);

    Optional<AuthorizationRequestEntity> findByRequestIdAndTenantId(UUID requestId, Long tenantId);
}
