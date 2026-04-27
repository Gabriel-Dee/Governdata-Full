package com.governdata.ehr_emr_be.importer;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class HealthcareDataImportService {

    private final JdbcTemplate jdbcTemplate;
    private final HealthcareImportProperties properties;

    public HealthcareDataImportService(JdbcTemplate jdbcTemplate, HealthcareImportProperties properties) {
        this.jdbcTemplate = jdbcTemplate;
        this.properties = properties;
    }

    @Transactional
    public ImportReport importCsv() throws IOException {
        int processed = 0;
        int insertedPatients = 0;
        int insertedEncounters = 0;
        int invalidRows = 0;

        Map<String, UUID> conditionIds = preloadLookup("condition_dim");
        Map<String, UUID> medicationIds = preloadLookup("medication_dim");

        try (BufferedReader reader = Files.newBufferedReader(Path.of(properties.getHealthcareCsvPath()))) {
            String header = reader.readLine();
            if (header == null) {
                return new ImportReport(0, 0, 0, 0);
            }

            String line;
            while ((line = reader.readLine()) != null) {
                processed++;
                String[] p = line.split(",", -1);
                if (p.length < 15) {
                    invalidRows++;
                    continue;
                }
                try {
                    UUID externalId = UUID.fromString(p[0].trim());
                    int age = Integer.parseInt(p[1].trim());
                    String gender = p[2].trim();
                    int bpSys = Integer.parseInt(p[3].trim());
                    int bpDia = Integer.parseInt(p[4].trim());
                    int heartRate = Integer.parseInt(p[5].trim());
                    int cholesterol = Integer.parseInt(p[6].trim());
                    String medicalCondition = p[7].trim();
                    String medication = p[8].trim();
                    LocalDate visitDate = LocalDate.parse(p[9].trim());
                    String diagnosis = p[10].trim();
                    int hospitalVisits = Integer.parseInt(p[11].trim());
                    double bmi = Double.parseDouble(p[12].trim());
                    String smokerStatus = p[13].trim();
                    String activityLevel = p[14].trim();

                    UUID patientProfileId = upsertPatientProfile(externalId, age, gender, smokerStatus, activityLevel);
                    if (patientProfileId != null) {
                        insertedPatients++;
                    } else {
                        patientProfileId = findPatientProfileId(externalId);
                    }
                    UUID encounterId = upsertEncounterFact(patientProfileId, visitDate, diagnosis, hospitalVisits);
                    if (encounterId != null) {
                        insertedEncounters++;
                    } else {
                        encounterId = findEncounterId(patientProfileId, visitDate);
                    }

                    jdbcTemplate.update("""
                            INSERT INTO vital_signs (encounter_fact_id, blood_pressure_systolic, blood_pressure_diastolic, heart_rate, bmi)
                            VALUES (?, ?, ?, ?, ?)
                            ON CONFLICT (encounter_fact_id)
                            DO UPDATE SET blood_pressure_systolic = EXCLUDED.blood_pressure_systolic,
                                          blood_pressure_diastolic = EXCLUDED.blood_pressure_diastolic,
                                          heart_rate = EXCLUDED.heart_rate,
                                          bmi = EXCLUDED.bmi
                            """, encounterId, bpSys, bpDia, heartRate, bmi);

                    jdbcTemplate.update("""
                            INSERT INTO lab_facts (encounter_fact_id, cholesterol_level)
                            VALUES (?, ?)
                            ON CONFLICT (encounter_fact_id)
                            DO UPDATE SET cholesterol_level = EXCLUDED.cholesterol_level
                            """, encounterId, cholesterol);

                    if (!medicalCondition.isBlank() && !"None".equalsIgnoreCase(medicalCondition)) {
                        UUID conditionId = conditionIds.computeIfAbsent(
                                medicalCondition.toLowerCase(),
                                k -> createLookup("condition_dim", medicalCondition));
                        jdbcTemplate.update("""
                                INSERT INTO patient_conditions (patient_profile_id, condition_id)
                                VALUES (?, ?)
                                ON CONFLICT (patient_profile_id, condition_id) DO NOTHING
                                """, patientProfileId, conditionId);
                    }

                    if (!medication.isBlank() && !"None".equalsIgnoreCase(medication)) {
                        UUID medicationId = medicationIds.computeIfAbsent(
                                medication.toLowerCase(),
                                k -> createLookup("medication_dim", medication));
                        jdbcTemplate.update("""
                                INSERT INTO encounter_medications (encounter_fact_id, medication_id)
                                VALUES (?, ?)
                                ON CONFLICT (encounter_fact_id, medication_id) DO NOTHING
                                """, encounterId, medicationId);
                    }
                } catch (Exception e) {
                    invalidRows++;
                }
            }
        }

        return new ImportReport(processed, insertedPatients, insertedEncounters, invalidRows);
    }

    private UUID upsertPatientProfile(UUID externalId, int age, String gender, String smokerStatus, String activityLevel) {
        UUID id = UUID.randomUUID();
        int rows = jdbcTemplate.update("""
                INSERT INTO patient_profiles (id, external_patient_id, age, gender, smoker_status, physical_activity_level)
                VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT (external_patient_id) DO NOTHING
                """, id, externalId, age, gender, smokerStatus, activityLevel);
        return rows > 0 ? id : null;
    }

    private UUID upsertEncounterFact(UUID patientProfileId, LocalDate visitDate, String diagnosisLabel, int hospitalVisits) {
        UUID id = UUID.randomUUID();
        int rows = jdbcTemplate.update("""
                INSERT INTO encounter_facts (id, patient_profile_id, visit_date, diagnosis_label, hospital_visits_past_year)
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT (patient_profile_id, visit_date) DO NOTHING
                """, id, patientProfileId, visitDate, diagnosisLabel, hospitalVisits);
        return rows > 0 ? id : null;
    }

    private UUID findPatientProfileId(UUID externalId) {
        return jdbcTemplate.queryForObject(
                "SELECT id FROM patient_profiles WHERE external_patient_id = ?",
                UUID.class,
                externalId
        );
    }

    private UUID findEncounterId(UUID patientProfileId, LocalDate visitDate) {
        return jdbcTemplate.queryForObject(
                "SELECT id FROM encounter_facts WHERE patient_profile_id = ? AND visit_date = ?",
                UUID.class,
                patientProfileId,
                visitDate
        );
    }

    private Map<String, UUID> preloadLookup(String tableName) {
        return jdbcTemplate.query("SELECT id, name FROM " + tableName, rs -> {
            Map<String, UUID> result = new HashMap<>();
            while (rs.next()) {
                result.put(rs.getString("name").toLowerCase(), (UUID) rs.getObject("id"));
            }
            return result;
        });
    }

    private UUID createLookup(String tableName, String value) {
        UUID id = UUID.randomUUID();
        jdbcTemplate.update("INSERT INTO " + tableName + " (id, name) VALUES (?, ?) ON CONFLICT (name) DO NOTHING", id, value);
        return jdbcTemplate.queryForObject("SELECT id FROM " + tableName + " WHERE name = ?", UUID.class, value);
    }
}
