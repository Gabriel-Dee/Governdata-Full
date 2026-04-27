package com.governdata.ehr_emr_be.importer;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class ImportSchemaInitializer implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    public ImportSchemaInitializer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS patient_profiles (
                    id UUID PRIMARY KEY,
                    external_patient_id UUID NOT NULL UNIQUE,
                    age INTEGER NOT NULL,
                    gender VARCHAR(32) NOT NULL,
                    smoker_status VARCHAR(16) NOT NULL,
                    physical_activity_level VARCHAR(32) NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
                """);
        jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS encounter_facts (
                    id UUID PRIMARY KEY,
                    patient_profile_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
                    visit_date DATE NOT NULL,
                    diagnosis_label VARCHAR(128) NOT NULL,
                    hospital_visits_past_year INTEGER NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE (patient_profile_id, visit_date)
                )
                """);
        jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS vital_signs (
                    encounter_fact_id UUID PRIMARY KEY REFERENCES encounter_facts(id) ON DELETE CASCADE,
                    blood_pressure_systolic INTEGER NOT NULL,
                    blood_pressure_diastolic INTEGER NOT NULL,
                    heart_rate INTEGER NOT NULL,
                    bmi NUMERIC(5,2) NOT NULL
                )
                """);
        jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS lab_facts (
                    encounter_fact_id UUID PRIMARY KEY REFERENCES encounter_facts(id) ON DELETE CASCADE,
                    cholesterol_level INTEGER NOT NULL
                )
                """);
        jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS condition_dim (
                    id UUID PRIMARY KEY,
                    name VARCHAR(128) NOT NULL UNIQUE
                )
                """);
        jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS patient_conditions (
                    patient_profile_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
                    condition_id UUID NOT NULL REFERENCES condition_dim(id) ON DELETE CASCADE,
                    PRIMARY KEY (patient_profile_id, condition_id)
                )
                """);
        jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS medication_dim (
                    id UUID PRIMARY KEY,
                    name VARCHAR(128) NOT NULL UNIQUE
                )
                """);
        jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS encounter_medications (
                    encounter_fact_id UUID NOT NULL REFERENCES encounter_facts(id) ON DELETE CASCADE,
                    medication_id UUID NOT NULL REFERENCES medication_dim(id) ON DELETE CASCADE,
                    PRIMARY KEY (encounter_fact_id, medication_id)
                )
                """);
    }
}
