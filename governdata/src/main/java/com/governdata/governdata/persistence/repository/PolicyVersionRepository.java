package com.governdata.governdata.persistence.repository;

import com.governdata.governdata.persistence.entity.PolicyVersionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PolicyVersionRepository extends JpaRepository<PolicyVersionEntity, Long> {

    Optional<PolicyVersionEntity> findByPolicyIdAndScopeKeyAndActiveTrue(Long policyId, String scopeKey);
}
