package com.governdata.ehr_emr_be.medication;

import com.governdata.ehr_emr_be.patient.Patient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface MedicationRepository extends JpaRepository<Medication, UUID> {

    @EntityGraph(attributePaths = {"patient"})
    Page<Medication> findAllByOrderByStartDateDesc(Pageable pageable);

    Page<Medication> findByPatientOrderByStartDateDesc(Patient patient, Pageable pageable);

    Page<Medication> findByPatientIdOrderByStartDateDesc(UUID patientId, Pageable pageable);
}
