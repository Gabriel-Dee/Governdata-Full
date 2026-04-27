package com.governdata.ehr_emr_be.diagnosis;

import com.governdata.ehr_emr_be.encounter.Encounter;
import com.governdata.ehr_emr_be.patient.Patient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface DiagnosisRepository extends JpaRepository<Diagnosis, UUID> {

    @EntityGraph(attributePaths = {"patient", "encounter"})
    Page<Diagnosis> findAllByOrderByOnsetDateDesc(Pageable pageable);

    Page<Diagnosis> findByPatientOrderByOnsetDateDesc(Patient patient, Pageable pageable);

    Page<Diagnosis> findByPatientIdOrderByOnsetDateDesc(UUID patientId, Pageable pageable);

    Page<Diagnosis> findByEncounterOrderByOnsetDateDesc(Encounter encounter, Pageable pageable);

    Page<Diagnosis> findByEncounterIdOrderByOnsetDateDesc(UUID encounterId, Pageable pageable);
}
