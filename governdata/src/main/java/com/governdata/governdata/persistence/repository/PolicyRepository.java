package com.governdata.governdata.persistence.repository;

import com.governdata.governdata.persistence.entity.PolicyEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PolicyRepository extends JpaRepository<PolicyEntity, Long> {

    Optional<PolicyEntity> findByName(String name);
}
