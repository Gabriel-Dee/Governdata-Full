package com.governdata.ehr_emr_be.patient;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PatientRepository extends JpaRepository<Patient, UUID> {

    Optional<Patient> findByMrn(String mrn);

    Page<Patient> findByLastNameContainingIgnoreCase(String lastName, Pageable pageable);
}
