package com.governdata.ehr_emr_be.encounter;

import com.governdata.ehr_emr_be.patient.Patient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface EncounterRepository extends JpaRepository<Encounter, UUID> {

    @EntityGraph(attributePaths = {"patient"})
    Page<Encounter> findAllByOrderByEncounterDateDesc(Pageable pageable);

    Page<Encounter> findByPatientOrderByEncounterDateDesc(Patient patient, Pageable pageable);

    Page<Encounter> findByPatientIdOrderByEncounterDateDesc(UUID patientId, Pageable pageable);
}
