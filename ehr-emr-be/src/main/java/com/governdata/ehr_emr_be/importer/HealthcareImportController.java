package com.governdata.ehr_emr_be.importer;

import com.governdata.ehr_emr_be.audit.AuditActions;
import com.governdata.ehr_emr_be.audit.AuditRecordingService;
import com.governdata.ehr_emr_be.audit.AuditResourceTypes;
import com.governdata.ehr_emr_be.audit.AuditSnapshotHasher;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping("/api/v1/admin/import")
public class HealthcareImportController {

    private final HealthcareDataImportService importService;
    private final HealthcareEmrCsvImportService emrCsvImportService;
    private final HealthcareImportProperties importProperties;
    private final AuditRecordingService auditRecordingService;

    public HealthcareImportController(HealthcareDataImportService importService,
                                      HealthcareEmrCsvImportService emrCsvImportService,
                                      HealthcareImportProperties importProperties,
                                      AuditRecordingService auditRecordingService) {
        this.importService = importService;
        this.emrCsvImportService = emrCsvImportService;
        this.importProperties = importProperties;
        this.auditRecordingService = auditRecordingService;
    }

    /**
     * Returns CSV path and row cap so an admin UI can show what will run before calling
     * {@link #importHealthcareEmrData(boolean)}.
     */
    @GetMapping("/healthcare-emr-config")
    @PreAuthorize("hasAuthority('SCOPE_staff.manage')")
    public ResponseEntity<EmrImportConfigResponse> getHealthcareEmrConfig() {
        return ResponseEntity.ok(EmrImportConfigResponse.from(importProperties));
    }

    /**
     * Legacy CSV → normalized analytics tables (patient_profiles, encounter_facts, …).
     */
    @PostMapping("/healthcare-data")
    @PreAuthorize("hasAuthority('SCOPE_staff.manage')")
    public ResponseEntity<ImportReport> importHealthcareData() throws IOException {
        ImportReport report = importService.importCsv();
        auditRecordingService.record(
                AuditActions.IMPORT,
                AuditResourceTypes.IMPORT,
                null,
                null,
                null,
                AuditSnapshotHasher.importReportHash(report));
        return ResponseEntity.ok(report);
    }

    /**
     * CSV → EMR API tables ({@code patients}, {@code encounters}, {@code diagnoses}, {@code medications}).
     * Use {@code replace=true} to wipe existing EMR + audit rows and reload from the CSV (recommended for demos).
     */
    @PostMapping("/healthcare-emr-data")
    @PreAuthorize("hasAuthority('SCOPE_staff.manage')")
    public ResponseEntity<EmrImportReport> importHealthcareEmrData(
            @RequestParam(name = "replace", defaultValue = "false") boolean replace) {
        EmrImportReport report = emrCsvImportService.importIntoEmrTables(replace);
        auditRecordingService.record(
                AuditActions.IMPORT,
                AuditResourceTypes.IMPORT,
                null,
                null,
                null,
                AuditSnapshotHasher.emrImportReportHash(report));
        return ResponseEntity.ok(report);
    }
}
