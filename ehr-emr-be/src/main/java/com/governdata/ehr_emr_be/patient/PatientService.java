package com.governdata.ehr_emr_be.patient;

import com.governdata.ehr_emr_be.audit.AuditActions;
import com.governdata.ehr_emr_be.audit.AuditRecordingService;
import com.governdata.ehr_emr_be.audit.AuditResourceTypes;
import com.governdata.ehr_emr_be.audit.AuditSnapshotHasher;
import com.governdata.ehr_emr_be.exception.ResourceNotFoundException;
import com.governdata.ehr_emr_be.governance.GovernanceClient;
import com.governdata.ehr_emr_be.governance.GovernanceAuthorizationFactory;
import com.governdata.ehr_emr_be.governance.GovernanceRequestContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class PatientService {

    private static final String RESOURCE_PATIENT = "patient";

    private final PatientRepository patientRepository;
    private final GovernanceClient governanceClient;
    private final GovernanceAuthorizationFactory governanceAuthorizationFactory;
    private final AuditRecordingService auditRecordingService;

    public PatientService(PatientRepository patientRepository, GovernanceClient governanceClient,
                          GovernanceAuthorizationFactory governanceAuthorizationFactory,
                          AuditRecordingService auditRecordingService) {
        this.patientRepository = patientRepository;
        this.governanceClient = governanceClient;
        this.governanceAuthorizationFactory = governanceAuthorizationFactory;
        this.auditRecordingService = auditRecordingService;
    }

    private void authorize(UUID patientId, String action) {
        var request = governanceAuthorizationFactory.build(patientId, RESOURCE_PATIENT, action);
        var response = governanceClient.authorize(request);
        GovernanceRequestContext.setLastAuthorization(response);
        if (!response.allowed()) {
            auditRecordingService.recordDeniedForActor(
                    GovernanceRequestContext.getRequiredUserId(),
                    "DENY_" + action.toUpperCase(),
                    AuditResourceTypes.PATIENT,
                    patientId,
                    patientId,
                    null,
                    null,
                    response
            );
            throw new AccessDeniedException(response.reason() != null ? response.reason() : "Access denied by governance");
        }
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('SCOPE_patient.read')")
    public Patient getById(UUID id) {
        authorize(id, "read");
        Patient found = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", id));
        auditRecordingService.record(
                AuditActions.READ,
                AuditResourceTypes.PATIENT,
                id,
                id,
                null,
                AuditSnapshotHasher.patientSnapshotHash(found));
        return found;
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('SCOPE_patient.list')")
    public Page<Patient> findAll(Pageable pageable) {
        authorize(null, "list");
        Page<Patient> page = patientRepository.findAll(pageable);
        auditRecordingService.record(
                AuditActions.LIST,
                AuditResourceTypes.PATIENT,
                null,
                null,
                null,
                null);
        return page;
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('SCOPE_patient.list')")
    public Page<Patient> findByLastName(String lastName, Pageable pageable) {
        authorize(null, "list");
        Page<Patient> page = patientRepository.findByLastNameContainingIgnoreCase(lastName, pageable);
        auditRecordingService.record(
                AuditActions.LIST,
                AuditResourceTypes.PATIENT,
                null,
                null,
                null,
                null);
        return page;
    }

    @Transactional
    @PreAuthorize("hasAuthority('SCOPE_patient.create')")
    public Patient create(Patient patient) {
        authorize(null, "create");
        Patient saved = patientRepository.save(patient);
        auditRecordingService.record(
                AuditActions.CREATE,
                AuditResourceTypes.PATIENT,
                saved.getId(),
                saved.getId(),
                null,
                AuditSnapshotHasher.patientSnapshotHash(saved));
        return saved;
    }

    @Transactional
    @PreAuthorize("hasAuthority('SCOPE_patient.update')")
    public Patient update(UUID id, Patient updates) {
        authorize(id, "update");
        Patient existing = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", id));
        String beforeHash = AuditSnapshotHasher.patientSnapshotHash(existing);
        if (updates.getFirstName() != null) {
            existing.setFirstName(updates.getFirstName());
        }
        if (updates.getLastName() != null) {
            existing.setLastName(updates.getLastName());
        }
        if (updates.getDob() != null) {
            existing.setDob(updates.getDob());
        }
        if (updates.getAge() != null) {
            existing.setAge(updates.getAge());
        }
        if (updates.getGender() != null) {
            existing.setGender(updates.getGender());
        }
        if (updates.getAddress() != null) {
            existing.setAddress(updates.getAddress());
        }
        if (updates.getPhone() != null) {
            existing.setPhone(updates.getPhone());
        }
        if (updates.getEmail() != null) {
            existing.setEmail(updates.getEmail());
        }
        Patient saved = patientRepository.save(existing);
        auditRecordingService.record(
                AuditActions.UPDATE,
                AuditResourceTypes.PATIENT,
                id,
                id,
                beforeHash,
                AuditSnapshotHasher.patientSnapshotHash(saved));
        return saved;
    }
}
