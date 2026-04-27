package com.governdata.ehr_emr_be.patient;

import com.governdata.ehr_emr_be.dto.PatientCreateDto;
import com.governdata.ehr_emr_be.dto.PatientDto;
import com.governdata.ehr_emr_be.dto.PatientUpdateDto;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/patients")
public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<PatientDto> getById(@PathVariable UUID id) {
        Patient patient = patientService.getById(id);
        return ResponseEntity.ok(PatientDto.from(patient));
    }

    @GetMapping
    public ResponseEntity<Page<PatientDto>> list(
            @RequestParam(required = false) String lastName,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<Patient> page = lastName != null && !lastName.isBlank()
                ? patientService.findByLastName(lastName, pageable)
                : patientService.findAll(pageable);
        return ResponseEntity.ok(page.map(PatientDto::from));
    }

    @PostMapping
    public ResponseEntity<PatientDto> create(@Valid @RequestBody PatientCreateDto dto) {
        Patient patient = new Patient();
        patient.setMrn(dto.mrn());
        patient.setFirstName(dto.firstName());
        patient.setLastName(dto.lastName());
        patient.setDob(dto.dob());
        patient.setAge(dto.age());
        patient.setGender(dto.gender());
        patient.setAddress(dto.address());
        patient.setPhone(dto.phone());
        patient.setEmail(dto.email());
        Patient created = patientService.create(patient);
        return ResponseEntity.status(HttpStatus.CREATED).body(PatientDto.from(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PatientDto> update(@PathVariable UUID id, @Valid @RequestBody PatientUpdateDto dto) {
        Patient updates = new Patient();
        updates.setFirstName(dto.firstName());
        updates.setLastName(dto.lastName());
        updates.setDob(dto.dob());
        updates.setAge(dto.age());
        updates.setGender(dto.gender());
        updates.setAddress(dto.address());
        updates.setPhone(dto.phone());
        updates.setEmail(dto.email());
        Patient updated = patientService.update(id, updates);
        return ResponseEntity.ok(PatientDto.from(updated));
    }
}
