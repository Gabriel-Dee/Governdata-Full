package com.governdata.ehr_emr_be.auth;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface UserAuthorizationRepository extends Repository<UserAccount, UUID> {

    @Query(value = """
            SELECT r.code
            FROM user_roles ur
            JOIN roles r ON r.id = ur.role_id
            WHERE ur.user_id = :userId
            """, nativeQuery = true)
    List<String> findRoleCodes(@Param("userId") UUID userId);

    @Query(value = """
            SELECT p.code
            FROM user_roles ur
            JOIN role_permissions rp ON rp.role_id = ur.role_id
            JOIN permissions p ON p.id = rp.permission_id
            WHERE ur.user_id = :userId
            """, nativeQuery = true)
    List<String> findPermissionCodes(@Param("userId") UUID userId);
}
