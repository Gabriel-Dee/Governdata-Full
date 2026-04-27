package com.governdata.governdata.persistence.repository;

import com.governdata.governdata.persistence.entity.PortalUserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PortalUserRepository extends JpaRepository<PortalUserEntity, Long> {
    Optional<PortalUserEntity> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);
}
