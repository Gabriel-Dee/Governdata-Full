package com.governdata.ehr_emr_be.diagnosis;

import com.governdata.ehr_emr_be.audit.AuditActions;
import com.governdata.ehr_emr_be.audit.AuditRecordingService;
import com.governdata.ehr_emr_be.audit.AuditResourceTypes;
import com.governdata.ehr_emr_be.audit.AuditSnapshotHasher;
import com.governdata.ehr_emr_be.encounter.Encounter;
import com.governdata.ehr_emr_be.encounter.EncounterRepository;
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

import java.util.Optional;
import java.util.UUID;

@Service
public class DiagnosisService {

    private static final String RESOURCE_DIAGNOSIS = "diagnosis";

    private final DiagnosisRepository diagnosisRepository;
    private final PatientRepository patientRepository;
    private final EncounterRepository encounterRepository;
    private final GovernanceClient governanceClient;
    private final GovernanceAuthorizationFactory governanceAuthorizationFactory;
    private final AuditRecordingService auditRecordingService;

    public DiagnosisService(DiagnosisRepository diagnosisRepository,
                            PatientRepository patientRepository,
                            EncounterRepository encounterRepository,
                            GovernanceClient governanceClient,
                            GovernanceAuthorizationFactory governanceAuthorizationFactory,
                            AuditRecordingService auditRecordingService) {
        this.diagnosisRepository = diagnosisRepository;
        this.patientRepository = patientRepository;
        this.encounterRepository = encounterRepository;
        this.governanceClient = governanceClient;
        this.governanceAuthorizationFactory = governanceAuthorizationFactory;
        this.auditRecordingService = auditRecordingService;
    }

    private void authorize(UUID patientId, String action) {
        var request = governanceAuthorizationFactory.build(patientId, RESOURCE_DIAGNOSIS, action);
        var response = governanceClient.authorize(request);
        GovernanceRequestContext.setLastAuthorization(response);
        if (!response.allowed()) {
            auditRecordingService.recordDeniedForActor(
                    GovernanceRequestContext.getRequiredUserId(),
                    "DENY_" + action.toUpperCase(),
                    AuditResourceTypes.DIAGNOSIS,
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
    @PreAuthorize("hasAuthority('SCOPE_diagnosis.read')")
    public Diagnosis getById(UUID id) {
        Diagnosis diagnosis = diagnosisRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Diagnosis", id));
        authorize(diagnosis.getPatient().getId(), "read");
        auditRecordingService.record(
                AuditActions.READ,
                AuditResourceTypes.DIAGNOSIS,
                id,
                diagnosis.getPatient().getId(),
                null,
                AuditSnapshotHasher.diagnosisSnapshotHash(diagnosis));
        return diagnosis;
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('SCOPE_diagnosis.read')")
    public Page<Diagnosis> findAll(Pageable pageable) {
        authorize(null, "list");
        Page<Diagnosis> page = diagnosisRepository.findAllByOrderByOnsetDateDesc(pageable);
        auditRecordingService.record(
                AuditActions.LIST,
                AuditResourceTypes.DIAGNOSIS,
                null,
                null,
                null,
                null);
        return page;
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('SCOPE_diagnosis.read')")
    public Page<Diagnosis> findByPatientId(UUID patientId, Pageable pageable) {
        authorize(patientId, "read");
        return diagnosisRepository.findByPatientIdOrderByOnsetDateDesc(patientId, pageable);
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('SCOPE_diagnosis.read')")
    public Page<Diagnosis> findByEncounterId(UUID encounterId, Pageable pageable) {
        Encounter encounter = encounterRepository.findById(encounterId)
                .orElseThrow(() -> new ResourceNotFoundException("Encounter", encounterId));
        authorize(encounter.getPatient().getId(), "read");
        Page<Diagnosis> page = diagnosisRepository.findByEncounterIdOrderByOnsetDateDesc(encounterId, pageable);
        auditRecordingService.record(
                AuditActions.LIST,
                AuditResourceTypes.DIAGNOSIS,
                null,
                encounter.getPatient().getId(),
                null,
                null);
        return page;
    }

    @Transactional
    @PreAuthorize("hasAuthority('SCOPE_diagnosis.create')")
    public Diagnosis create(UUID patientId, Optional<UUID> encounterId, Diagnosis diagnosis) {
        authorize(patientId, "create");
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", patientId));
        diagnosis.setPatient(patient);
        if (encounterId.isPresent()) {
            Encounter encounter = encounterRepository.findById(encounterId.get())
                    .orElseThrow(() -> new ResourceNotFoundException("Encounter", encounterId.get()));
            diagnosis.setEncounter(encounter);
        }
        Diagnosis saved = diagnosisRepository.save(diagnosis);
        auditRecordingService.record(
                AuditActions.CREATE,
                AuditResourceTypes.DIAGNOSIS,
                saved.getId(),
                patientId,
                null,
                AuditSnapshotHasher.diagnosisSnapshotHash(saved));
        return saved;
    }

    @Transactional
    @PreAuthorize("hasAuthority('SCOPE_diagnosis.create')")
    public Diagnosis update(UUID patientId, UUID diagnosisId, Optional<UUID> encounterId, Diagnosis updates) {
        authorize(patientId, "update");
        Diagnosis existing = diagnosisRepository.findById(diagnosisId)
                .orElseThrow(() -> new ResourceNotFoundException("Diagnosis", diagnosisId));
        if (!existing.getPatient().getId().equals(patientId)) {
            throw new ResourceNotFoundException("Diagnosis", diagnosisId);
        }
        String beforeHash = AuditSnapshotHasher.diagnosisSnapshotHash(existing);
        existing.setCode(updates.getCode());
        existing.setDescription(updates.getDescription());
        existing.setOnsetDate(updates.getOnsetDate());
        existing.setResolvedDate(updates.getResolvedDate());
        if (encounterId.isPresent()) {
            Encounter encounter = encounterRepository.findById(encounterId.get())
                    .orElseThrow(() -> new ResourceNotFoundException("Encounter", encounterId.get()));
            if (!encounter.getPatient().getId().equals(patientId)) {
                throw new ResourceNotFoundException("Encounter", encounterId.get());
            }
            existing.setEncounter(encounter);
        } else {
            existing.setEncounter(null);
        }
        Diagnosis saved = diagnosisRepository.save(existing);
        auditRecordingService.record(
                AuditActions.UPDATE,
                AuditResourceTypes.DIAGNOSIS,
                saved.getId(),
                patientId,
                beforeHash,
                AuditSnapshotHasher.diagnosisSnapshotHash(saved));
        return saved;
    }
}
