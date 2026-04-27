package com.governdata.ehr_emr_be.encounter;

import com.governdata.ehr_emr_be.audit.AuditActions;
import com.governdata.ehr_emr_be.audit.AuditRecordingService;
import com.governdata.ehr_emr_be.audit.AuditResourceTypes;
import com.governdata.ehr_emr_be.audit.AuditSnapshotHasher;
import com.governdata.ehr_emr_be.exception.ResourceNotFoundException;
import com.governdata.ehr_emr_be.governance.GovernanceClient;
import com.governdata.ehr_emr_be.governance.GovernanceAuthorizationFactory;
import com.governdata.ehr_emr_be.governance.GovernanceRequestContext;
import com.governdata.ehr_emr_be.patient.Patient;
import com.governdata.ehr_emr_be.patient.PatientRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class EncounterService {

    private static final String RESOURCE_ENCOUNTER = "encounter";

    private final EncounterRepository encounterRepository;
    private final PatientRepository patientRepository;
    private final GovernanceClient governanceClient;
    private final GovernanceAuthorizationFactory governanceAuthorizationFactory;
    private final AuditRecordingService auditRecordingService;

    public EncounterService(EncounterRepository encounterRepository,
                            PatientRepository patientRepository,
                            GovernanceClient governanceClient,
                            GovernanceAuthorizationFactory governanceAuthorizationFactory,
                            AuditRecordingService auditRecordingService) {
        this.encounterRepository = encounterRepository;
        this.patientRepository = patientRepository;
        this.governanceClient = governanceClient;
        this.governanceAuthorizationFactory = governanceAuthorizationFactory;
        this.auditRecordingService = auditRecordingService;
    }

    private void authorize(UUID patientId, String action) {
        var request = governanceAuthorizationFactory.build(patientId, RESOURCE_ENCOUNTER, action);
        var response = governanceClient.authorize(request);
        GovernanceRequestContext.setLastAuthorization(response);
        if (!response.allowed()) {
            auditRecordingService.recordDeniedForActor(
                    GovernanceRequestContext.getRequiredUserId(),
                    "DENY_" + action.toUpperCase(),
                    AuditResourceTypes.ENCOUNTER,
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
    @PreAuthorize("hasAuthority('SCOPE_encounter.read')")
    public Encounter getById(UUID id) {
        Encounter encounter = encounterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Encounter", id));
        authorize(encounter.getPatient().getId(), "read");
        auditRecordingService.record(
                AuditActions.READ,
                AuditResourceTypes.ENCOUNTER,
                id,
                encounter.getPatient().getId(),
                null,
                AuditSnapshotHasher.encounterSnapshotHash(encounter));
        return encounter;
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('SCOPE_encounter.read')")
    public Page<Encounter> findAll(Pageable pageable) {
        authorize(null, "list");
        Page<Encounter> page = encounterRepository.findAllByOrderByEncounterDateDesc(pageable);
        auditRecordingService.record(
                AuditActions.LIST,
                AuditResourceTypes.ENCOUNTER,
                null,
                null,
                null,
                null);
        return page;
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('SCOPE_encounter.read')")
    public Page<Encounter> findByPatientId(UUID patientId, Pageable pageable) {
        authorize(patientId, "read");
        Page<Encounter> page = encounterRepository.findByPatientIdOrderByEncounterDateDesc(patientId, pageable);
        auditRecordingService.record(
                AuditActions.LIST,
                AuditResourceTypes.ENCOUNTER,
                null,
                patientId,
                null,
                null);
        return page;
    }

    @Transactional
    @PreAuthorize("hasAuthority('SCOPE_encounter.create')")
    public Encounter create(UUID patientId, Encounter encounter) {
        authorize(patientId, "create");
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", patientId));
        encounter.setPatient(patient);
        Encounter saved = encounterRepository.save(encounter);
        auditRecordingService.record(
                AuditActions.CREATE,
                AuditResourceTypes.ENCOUNTER,
                saved.getId(),
                patientId,
                null,
                AuditSnapshotHasher.encounterSnapshotHash(saved));
        return saved;
    }

    @Transactional
    @PreAuthorize("hasAuthority('SCOPE_encounter.create')")
    public Encounter update(UUID patientId, UUID encounterId, Encounter updates) {
        authorize(patientId, "update");
        Encounter existing = encounterRepository.findById(encounterId)
                .orElseThrow(() -> new ResourceNotFoundException("Encounter", encounterId));
        if (!existing.getPatient().getId().equals(patientId)) {
            throw new ResourceNotFoundException("Encounter", encounterId);
        }
        String beforeHash = AuditSnapshotHasher.encounterSnapshotHash(existing);
        existing.setEncounterDate(updates.getEncounterDate());
        existing.setType(updates.getType());
        existing.setReason(updates.getReason());
        existing.setProviderId(updates.getProviderId());
        existing.setLocation(updates.getLocation());
        Encounter saved = encounterRepository.save(existing);
        auditRecordingService.record(
                AuditActions.UPDATE,
                AuditResourceTypes.ENCOUNTER,
                saved.getId(),
                patientId,
                beforeHash,
                AuditSnapshotHasher.encounterSnapshotHash(saved));
        return saved;
    }
}
