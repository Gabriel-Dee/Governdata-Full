package com.governdata.ehr_emr_be.audit;

import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class AuditEventQueryService {

    private final AuditEventRepository auditEventRepository;

    public AuditEventQueryService(AuditEventRepository auditEventRepository) {
        this.auditEventRepository = auditEventRepository;
    }

    @Transactional(readOnly = true)
    public Page<AuditEventDto> search(String resourceType, UUID actorUserId, Pageable pageable) {
        Specification<AuditEvent> spec = (root, query, cb) -> {
            List<Predicate> parts = new ArrayList<>();
            if (resourceType != null && !resourceType.isBlank()) {
                parts.add(cb.equal(root.get("resourceType"), resourceType.trim()));
            }
            if (actorUserId != null) {
                parts.add(cb.equal(root.get("actorUserId"), actorUserId));
            }
            if (parts.isEmpty()) {
                return cb.conjunction();
            }
            return cb.and(parts.toArray(new Predicate[0]));
        };
        return auditEventRepository.findAll(spec, pageable).map(AuditEventDto::from);
    }
}
