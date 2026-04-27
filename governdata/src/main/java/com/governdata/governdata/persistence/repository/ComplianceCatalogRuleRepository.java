package com.governdata.governdata.persistence.repository;

import com.governdata.governdata.persistence.entity.ComplianceCatalogRuleEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface ComplianceCatalogRuleRepository extends JpaRepository<ComplianceCatalogRuleEntity, Long> {

    List<ComplianceCatalogRuleEntity> findByFrameworkInOrderByFrameworkAscSortOrderAsc(Collection<String> frameworks);
}
