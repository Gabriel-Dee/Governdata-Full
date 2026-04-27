package com.governdata.ehr_emr_be.diagnosis;

import com.governdata.ehr_emr_be.dto.DiagnosisCreateDto;
import com.governdata.ehr_emr_be.dto.DiagnosisDto;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class DiagnosisController {

    private final DiagnosisService diagnosisService;

    public DiagnosisController(DiagnosisService diagnosisService) {
        this.diagnosisService = diagnosisService;
    }

    @GetMapping("/diagnoses")
    public ResponseEntity<Page<DiagnosisDto>> listAll(
            @PageableDefault(size = 20) Pageable pageable) {
        Page<Diagnosis> page = diagnosisService.findAll(pageable);
        return ResponseEntity.ok(page.map(DiagnosisDto::from));
    }

    @GetMapping("/diagnoses/{id}")
    public ResponseEntity<DiagnosisDto> getById(@PathVariable UUID id) {
        Diagnosis diagnosis = diagnosisService.getById(id);
        return ResponseEntity.ok(DiagnosisDto.from(diagnosis));
    }

    @GetMapping("/patients/{patientId}/diagnoses")
    public ResponseEntity<Page<DiagnosisDto>> listByPatient(
            @PathVariable UUID patientId,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<Diagnosis> page = diagnosisService.findByPatientId(patientId, pageable);
        return ResponseEntity.ok(page.map(DiagnosisDto::from));
    }

    @GetMapping("/encounters/{encounterId}/diagnoses")
    public ResponseEntity<Page<DiagnosisDto>> listByEncounter(
            @PathVariable UUID encounterId,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<Diagnosis> page = diagnosisService.findByEncounterId(encounterId, pageable);
        return ResponseEntity.ok(page.map(DiagnosisDto::from));
    }

    @PostMapping("/patients/{patientId}/diagnoses")
    public ResponseEntity<DiagnosisDto> create(
            @PathVariable UUID patientId,
            @Valid @RequestBody DiagnosisCreateDto dto) {
        Diagnosis diagnosis = new Diagnosis();
        diagnosis.setCode(dto.code());
        diagnosis.setDescription(dto.description());
        diagnosis.setOnsetDate(dto.onsetDate());
        diagnosis.setResolvedDate(dto.resolvedDate());
        Diagnosis created = diagnosisService.create(
                patientId,
                Optional.ofNullable(dto.encounterId()),
                diagnosis);
        return ResponseEntity.status(HttpStatus.CREATED).body(DiagnosisDto.from(created));
    }

    @PutMapping("/patients/{patientId}/diagnoses/{diagnosisId}")
    public ResponseEntity<DiagnosisDto> update(
            @PathVariable UUID patientId,
            @PathVariable UUID diagnosisId,
            @Valid @RequestBody DiagnosisCreateDto dto) {
        Diagnosis updates = new Diagnosis();
        updates.setCode(dto.code());
        updates.setDescription(dto.description());
        updates.setOnsetDate(dto.onsetDate());
        updates.setResolvedDate(dto.resolvedDate());
        Diagnosis updated = diagnosisService.update(
                patientId,
                diagnosisId,
                Optional.ofNullable(dto.encounterId()),
                updates);
        return ResponseEntity.ok(DiagnosisDto.from(updated));
    }
}
