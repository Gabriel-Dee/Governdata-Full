package com.governdata.ehr_emr_be.medication;

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
public class MedicationService {

    private static final String RESOURCE_MEDICATION = "medication";

    private final MedicationRepository medicationRepository;
    private final PatientRepository patientRepository;
    private final GovernanceClient governanceClient;
    private final GovernanceAuthorizationFactory governanceAuthorizationFactory;
    private final AuditRecordingService auditRecordingService;

    public MedicationService(MedicationRepository medicationRepository,
                             PatientRepository patientRepository,
                             GovernanceClient governanceClient,
                             GovernanceAuthorizationFactory governanceAuthorizationFactory,
                             AuditRecordingService auditRecordingService) {
        this.medicationRepository = medicationRepository;
        this.patientRepository = patientRepository;
        this.governanceClient = governanceClient;
        this.governanceAuthorizationFactory = governanceAuthorizationFactory;
        this.auditRecordingService = auditRecordingService;
    }

    private void authorize(UUID patientId, String action) {
        var request = governanceAuthorizationFactory.build(patientId, RESOURCE_MEDICATION, action);
        var response = governanceClient.authorize(request);
        GovernanceRequestContext.setLastAuthorization(response);
        if (!response.allowed()) {
            auditRecordingService.recordDeniedForActor(
                    GovernanceRequestContext.getRequiredUserId(),
                    "DENY_" + action.toUpperCase(),
                    AuditResourceTypes.MEDICATION,
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
    @PreAuthorize("hasAuthority('SCOPE_medication.read')")
    public Medication getById(UUID id) {
        Medication medication = medicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medication", id));
        authorize(medication.getPatient().getId(), "read");
        auditRecordingService.record(
                AuditActions.READ,
                AuditResourceTypes.MEDICATION,
                id,
                medication.getPatient().getId(),
                null,
                AuditSnapshotHasher.medicationSnapshotHash(medication));
        return medication;
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('SCOPE_medication.read')")
    public Page<Medication> findAll(Pageable pageable) {
        authorize(null, "list");
        Page<Medication> page = medicationRepository.findAllByOrderByStartDateDesc(pageable);
        auditRecordingService.record(
                AuditActions.LIST,
                AuditResourceTypes.MEDICATION,
                null,
                null,
                null,
                null);
        return page;
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('SCOPE_medication.read')")
    public Page<Medication> findByPatientId(UUID patientId, Pageable pageable) {
        authorize(patientId, "read");
        Page<Medication> page = medicationRepository.findByPatientIdOrderByStartDateDesc(patientId, pageable);
        auditRecordingService.record(
                AuditActions.LIST,
                AuditResourceTypes.MEDICATION,
                null,
                patientId,
                null,
                null);
        return page;
    }

    @Transactional
    @PreAuthorize("hasAuthority('SCOPE_medication.create')")
    public Medication create(UUID patientId, Medication medication) {
        authorize(patientId, "create");
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", patientId));
        medication.setPatient(patient);
        Medication saved = medicationRepository.save(medication);
        auditRecordingService.record(
                AuditActions.CREATE,
                AuditResourceTypes.MEDICATION,
                saved.getId(),
                patientId,
                null,
                AuditSnapshotHasher.medicationSnapshotHash(saved));
        return saved;
    }

    @Transactional
    @PreAuthorize("hasAuthority('SCOPE_medication.create')")
    public Medication update(UUID patientId, UUID medicationId, Medication updates) {
        authorize(patientId, "update");
        Medication existing = medicationRepository.findById(medicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Medication", medicationId));
        if (!existing.getPatient().getId().equals(patientId)) {
            throw new ResourceNotFoundException("Medication", medicationId);
        }
        String beforeHash = AuditSnapshotHasher.medicationSnapshotHash(existing);
        existing.setDrugName(updates.getDrugName());
        existing.setDose(updates.getDose());
        existing.setRoute(updates.getRoute());
        existing.setFrequency(updates.getFrequency());
        existing.setStartDate(updates.getStartDate());
        existing.setEndDate(updates.getEndDate());
        existing.setPrescribingProviderId(updates.getPrescribingProviderId());
        Medication saved = medicationRepository.save(existing);
        auditRecordingService.record(
                AuditActions.UPDATE,
                AuditResourceTypes.MEDICATION,
                saved.getId(),
                patientId,
                beforeHash,
                AuditSnapshotHasher.medicationSnapshotHash(saved));
        return saved;
    }
}
