package com.governdata.ehr_emr_be.importer;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

/**
 * Loads {@code Healthcare data.csv} into EMR tables. Patient rows use {@code Patient_ID} as primary key,
 * {@code Age} and {@code Gender} from the file; no synthetic names or contact data.
 */
@Service
public class HealthcareEmrCsvImportService {

    private final JdbcTemplate jdbcTemplate;
    private final HealthcareImportProperties properties;

    public HealthcareEmrCsvImportService(JdbcTemplate jdbcTemplate, HealthcareImportProperties properties) {
        this.jdbcTemplate = jdbcTemplate;
        this.properties = properties;
    }

    @Transactional(timeout = 7200)
    public EmrImportReport importIntoEmrTables(boolean replaceExisting) {
        if (replaceExisting) {
            jdbcTemplate.update("DELETE FROM medications");
            jdbcTemplate.update("DELETE FROM diagnoses");
            jdbcTemplate.update("DELETE FROM encounters");
            jdbcTemplate.update("DELETE FROM patients");
            jdbcTemplate.update("DELETE FROM audit_event");
        }

        int rowsRead = 0;
        int patientsInserted = 0;
        int encountersInserted = 0;
        int diagnosesInserted = 0;
        int medicationsInserted = 0;
        int skippedRows = 0;

        Set<UUID> patientsSeen = new HashSet<>();
        OffsetDateTime now = OffsetDateTime.now();

        int maxRows = properties.getEmrMaxRows();
        Path path = Path.of(properties.getHealthcareCsvPath());

        try (BufferedReader reader = Files.newBufferedReader(path)) {
            String header = reader.readLine();
            if (header == null) {
                return new EmrImportReport(0, 0, 0, 0, 0, 0, replaceExisting);
            }

            String line;
            while ((line = reader.readLine()) != null) {
                if (maxRows > 0 && rowsRead >= maxRows) {
                    break;
                }
                rowsRead++;
                String[] p = line.split(",", -1);
                if (p.length < 15) {
                    skippedRows++;
                    continue;
                }
                try {
                    UUID patientId = UUID.fromString(p[0].trim());
                    int age = Integer.parseInt(p[1].trim());
                    String genderRaw = p[2].trim();
                    int bpSys = Integer.parseInt(p[3].trim());
                    int bpDia = Integer.parseInt(p[4].trim());
                    int heartRate = Integer.parseInt(p[5].trim());
                    int cholesterol = Integer.parseInt(p[6].trim());
                    String medicalCondition = p[7].trim();
                    String medication = p[8].trim();
                    LocalDate visitDate = LocalDate.parse(p[9].trim());
                    String diagnosisLabel = p[10].trim();
                    int hospitalVisits = Integer.parseInt(p[11].trim());
                    String bmi = p[12].trim();
                    String smokerStatus = p[13].trim();
                    String activityLevel = p[14].trim();

                    String gender = normalizeGender(genderRaw);
                    String mrn = patientId.toString();

                    if (!patientsSeen.contains(patientId)) {
                        int n = jdbcTemplate.update("""
                                        INSERT INTO patients (id, mrn, first_name, last_name, dob, gender, age, address, phone, email, created_at, updated_at)
                                        VALUES (?, ?, NULL, NULL, NULL, ?, ?, NULL, NULL, NULL, ?, ?)
                                        ON CONFLICT (id) DO NOTHING
                                        """,
                                patientId, mrn, gender, age, now, now);
                        if (n > 0) {
                            patientsInserted++;
                        }
                        patientsSeen.add(patientId);
                    }

                    UUID encounterId = UUID.randomUUID();
                    String encType = diagnosisLabel.toLowerCase().contains("emergency")
                            ? "EMERGENCY"
                            : (diagnosisLabel.toLowerCase().contains("infection") ? "INPATIENT" : "OUTPATIENT");
                    String reason = buildEncounterReason(diagnosisLabel, medicalCondition, hospitalVisits,
                            bpSys, bpDia, heartRate, cholesterol, bmi, smokerStatus, activityLevel);
                    String providerId = "PROV-" + String.format("%04d", Math.floorMod(patientId.getMostSignificantBits(), 5000));
                    String location = "CSV import — visit row";

                    jdbcTemplate.update("""
                                    INSERT INTO encounters (id, patient_id, encounter_date, type, reason, provider_id, location, created_at, updated_at)
                                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                                    """,
                            encounterId,
                            patientId,
                            encounterDateAtNoonUtc(visitDate),
                            encType,
                            truncate(reason, 512),
                            providerId,
                            location,
                            now,
                            now);
                    encountersInserted++;

                    UUID diagnosisId = UUID.randomUUID();
                    String code = DiagnosisCoding.labelToCode(diagnosisLabel);
                    jdbcTemplate.update("""
                                    INSERT INTO diagnoses (id, patient_id, encounter_id, code, description, onset_date, resolved_date, created_at, updated_at)
                                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                                    """,
                            diagnosisId,
                            patientId,
                            encounterId,
                            code,
                            truncate(diagnosisLabel + " — " + medicalCondition, 512),
                            visitDate,
                            null,
                            now,
                            now);
                    diagnosesInserted++;

                    if (!medication.isBlank() && !"None".equalsIgnoreCase(medication)) {
                        UUID medId = UUID.randomUUID();
                        jdbcTemplate.update("""
                                        INSERT INTO medications (id, patient_id, drug_name, dose, route, frequency, start_date, end_date, prescribing_provider_id, created_at, updated_at)
                                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                                        """,
                                medId,
                                patientId,
                                medication,
                                "per protocol",
                                "oral",
                                "as directed",
                                visitDate,
                                null,
                                providerId,
                                now,
                                now);
                        medicationsInserted++;
                    }
                } catch (Exception e) {
                    skippedRows++;
                }
            }
        } catch (Exception e) {
            throw new IllegalStateException("EMR CSV import failed: " + e.getMessage(), e);
        }

        return new EmrImportReport(
                rowsRead,
                patientsInserted,
                encountersInserted,
                diagnosesInserted,
                medicationsInserted,
                skippedRows,
                replaceExisting);
    }

    private static String buildEncounterReason(String diagnosisLabel, String medicalCondition, int hospitalVisits,
                                               int bpSys, int bpDia, int heartRate, int cholesterol,
                                               String bmi, String smokerStatus, String activityLevel) {
        return diagnosisLabel + " | " + medicalCondition
                + " | BP=" + bpSys + "/" + bpDia + " HR=" + heartRate + " Chol=" + cholesterol
                + " BMI=" + bmi + " smoker=" + smokerStatus + " activity=" + activityLevel
                + " visits/yr=" + hospitalVisits;
    }

    private static String normalizeGender(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        String g = raw.trim();
        if (g.equalsIgnoreCase("Female")) {
            return "F";
        }
        if (g.equalsIgnoreCase("Male")) {
            return "M";
        }
        return g;
    }

    private static OffsetDateTime encounterDateAtNoonUtc(LocalDate visitDate) {
        return OffsetDateTime.of(visitDate, LocalTime.NOON, ZoneOffset.UTC);
    }

    private static String truncate(String s, int max) {
        if (s == null) {
            return null;
        }
        return s.length() <= max ? s : s.substring(0, max);
    }
}
