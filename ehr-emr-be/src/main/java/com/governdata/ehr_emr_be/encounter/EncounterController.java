package com.governdata.ehr_emr_be.encounter;

import com.governdata.ehr_emr_be.dto.EncounterCreateDto;
import com.governdata.ehr_emr_be.dto.EncounterDto;
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
public class EncounterController {

    private final EncounterService encounterService;

    public EncounterController(EncounterService encounterService) {
        this.encounterService = encounterService;
    }

    @GetMapping("/encounters")
    public ResponseEntity<Page<EncounterDto>> listAll(
            @PageableDefault(size = 20) Pageable pageable) {
        Page<Encounter> page = encounterService.findAll(pageable);
        return ResponseEntity.ok(page.map(EncounterDto::from));
    }

    @GetMapping("/encounters/{id}")
    public ResponseEntity<EncounterDto> getById(@PathVariable UUID id) {
        Encounter encounter = encounterService.getById(id);
        return ResponseEntity.ok(EncounterDto.from(encounter));
    }

    @GetMapping("/patients/{patientId}/encounters")
    public ResponseEntity<Page<EncounterDto>> listByPatient(
            @PathVariable UUID patientId,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<Encounter> page = encounterService.findByPatientId(patientId, pageable);
        return ResponseEntity.ok(page.map(EncounterDto::from));
    }

    @PostMapping("/patients/{patientId}/encounters")
    public ResponseEntity<EncounterDto> create(
            @PathVariable UUID patientId,
            @Valid @RequestBody EncounterCreateDto dto) {
        Encounter encounter = new Encounter();
        encounter.setEncounterDate(dto.encounterDate());
        encounter.setType(dto.type());
        encounter.setReason(dto.reason());
        encounter.setProviderId(dto.providerId());
        encounter.setLocation(dto.location());
        Encounter created = encounterService.create(patientId, encounter);
        return ResponseEntity.status(HttpStatus.CREATED).body(EncounterDto.from(created));
    }

    @PutMapping("/patients/{patientId}/encounters/{encounterId}")
    public ResponseEntity<EncounterDto> update(
            @PathVariable UUID patientId,
            @PathVariable UUID encounterId,
            @Valid @RequestBody EncounterCreateDto dto) {
        Encounter updates = new Encounter();
        updates.setEncounterDate(dto.encounterDate());
        updates.setType(dto.type());
        updates.setReason(dto.reason());
        updates.setProviderId(dto.providerId());
        updates.setLocation(dto.location());
        Encounter updated = encounterService.update(patientId, encounterId, updates);
        return ResponseEntity.ok(EncounterDto.from(updated));
    }
}
