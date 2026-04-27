package com.governdata.ehr_emr_be.medication;

import com.governdata.ehr_emr_be.dto.MedicationCreateDto;
import com.governdata.ehr_emr_be.dto.MedicationDto;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class MedicationController {

    private final MedicationService medicationService;

    public MedicationController(MedicationService medicationService) {
        this.medicationService = medicationService;
    }

    @GetMapping("/medications")
    public ResponseEntity<Page<MedicationDto>> listAll(
            @PageableDefault(size = 20) Pageable pageable) {
        Page<Medication> page = medicationService.findAll(pageable);
        return ResponseEntity.ok(page.map(MedicationDto::from));
    }

    @GetMapping("/medications/{id}")
    public ResponseEntity<MedicationDto> getById(@PathVariable UUID id) {
        Medication medication = medicationService.getById(id);
        return ResponseEntity.ok(MedicationDto.from(medication));
    }

    @GetMapping("/patients/{patientId}/medications")
    public ResponseEntity<Page<MedicationDto>> listByPatient(
            @PathVariable UUID patientId,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<Medication> page = medicationService.findByPatientId(patientId, pageable);
        return ResponseEntity.ok(page.map(MedicationDto::from));
    }

    @PostMapping("/patients/{patientId}/medications")
    public ResponseEntity<MedicationDto> create(
            @PathVariable UUID patientId,
            @Valid @RequestBody MedicationCreateDto dto) {
        Medication medication = new Medication();
        medication.setDrugName(dto.drugName());
        medication.setDose(dto.dose());
        medication.setRoute(dto.route());
        medication.setFrequency(dto.frequency());
        medication.setStartDate(dto.startDate());
        medication.setEndDate(dto.endDate());
        medication.setPrescribingProviderId(dto.prescribingProviderId());
        Medication created = medicationService.create(patientId, medication);
        return ResponseEntity.status(HttpStatus.CREATED).body(MedicationDto.from(created));
    }

    @PutMapping("/patients/{patientId}/medications/{medicationId}")
    public ResponseEntity<MedicationDto> update(
            @PathVariable UUID patientId,
            @PathVariable UUID medicationId,
            @Valid @RequestBody MedicationCreateDto dto) {
        Medication updates = new Medication();
        updates.setDrugName(dto.drugName());
        updates.setDose(dto.dose());
        updates.setRoute(dto.route());
        updates.setFrequency(dto.frequency());
        updates.setStartDate(dto.startDate());
        updates.setEndDate(dto.endDate());
        updates.setPrescribingProviderId(dto.prescribingProviderId());
        Medication updated = medicationService.update(patientId, medicationId, updates);
        return ResponseEntity.ok(MedicationDto.from(updated));
    }
}
