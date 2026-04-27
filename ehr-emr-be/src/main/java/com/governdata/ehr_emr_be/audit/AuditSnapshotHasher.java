package com.governdata.ehr_emr_be.audit;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.governdata.ehr_emr_be.diagnosis.Diagnosis;
import com.governdata.ehr_emr_be.encounter.Encounter;
import com.governdata.ehr_emr_be.importer.EmrImportReport;
import com.governdata.ehr_emr_be.importer.ImportReport;
import com.governdata.ehr_emr_be.medication.Medication;
import com.governdata.ehr_emr_be.patient.Patient;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Canonical SHA-256 hashes over sorted JSON maps for integrity comparison (research baseline).
 * Payloads may contain PHI-equivalent fields; protect the audit table like production clinical data.
 */
public final class AuditSnapshotHasher {

    private static final ObjectMapper MAPPER = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
            .setDefaultPropertyInclusion(JsonInclude.Value.construct(JsonInclude.Include.NON_NULL, JsonInclude.Include.ALWAYS));

    private AuditSnapshotHasher() {}

    public static String patientSnapshotHash(Patient p) {
        if (p == null) {
            return null;
        }
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("address", p.getAddress());
        m.put("age", p.getAge());
        m.put("createdAt", p.getCreatedAt());
        m.put("dob", p.getDob());
        m.put("email", p.getEmail());
        m.put("firstName", p.getFirstName());
        m.put("gender", p.getGender());
        m.put("id", p.getId());
        m.put("lastName", p.getLastName());
        m.put("mrn", p.getMrn());
        m.put("phone", p.getPhone());
        m.put("updatedAt", p.getUpdatedAt());
        return sha256Json(m);
    }

    public static String encounterSnapshotHash(Encounter e) {
        if (e == null) {
            return null;
        }
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("encounterDate", e.getEncounterDate());
        m.put("id", e.getId());
        m.put("location", e.getLocation());
        m.put("patientId", e.getPatient() != null ? e.getPatient().getId() : null);
        m.put("providerId", e.getProviderId());
        m.put("reason", e.getReason());
        m.put("type", e.getType());
        m.put("createdAt", e.getCreatedAt());
        m.put("updatedAt", e.getUpdatedAt());
        return sha256Json(m);
    }

    public static String diagnosisSnapshotHash(Diagnosis d) {
        if (d == null) {
            return null;
        }
        UUID encId = d.getEncounter() != null ? d.getEncounter().getId() : null;
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("code", d.getCode());
        m.put("description", d.getDescription());
        m.put("id", d.getId());
        m.put("encounterId", encId);
        m.put("onsetDate", d.getOnsetDate());
        m.put("patientId", d.getPatient() != null ? d.getPatient().getId() : null);
        m.put("resolvedDate", d.getResolvedDate());
        m.put("createdAt", d.getCreatedAt());
        m.put("updatedAt", d.getUpdatedAt());
        return sha256Json(m);
    }

    public static String medicationSnapshotHash(Medication m) {
        if (m == null) {
            return null;
        }
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("dose", m.getDose());
        map.put("drugName", m.getDrugName());
        map.put("endDate", m.getEndDate());
        map.put("frequency", m.getFrequency());
        map.put("id", m.getId());
        map.put("patientId", m.getPatient() != null ? m.getPatient().getId() : null);
        map.put("prescribingProviderId", m.getPrescribingProviderId());
        map.put("route", m.getRoute());
        map.put("startDate", m.getStartDate());
        map.put("createdAt", m.getCreatedAt());
        map.put("updatedAt", m.getUpdatedAt());
        return sha256Json(map);
    }

    public static String importReportHash(ImportReport r) {
        if (r == null) {
            return null;
        }
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("insertedEncounters", r.insertedEncounters());
        m.put("insertedPatients", r.insertedPatients());
        m.put("invalidRows", r.invalidRows());
        m.put("processedRows", r.processedRows());
        return sha256Json(m);
    }

    public static String emrImportReportHash(EmrImportReport r) {
        if (r == null) {
            return null;
        }
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("diagnosesInserted", r.diagnosesInserted());
        m.put("encountersInserted", r.encountersInserted());
        m.put("medicationsInserted", r.medicationsInserted());
        m.put("patientsInserted", r.patientsInserted());
        m.put("replacedExistingData", r.replacedExistingData());
        m.put("rowsRead", r.rowsRead());
        m.put("skippedRows", r.skippedRows());
        return sha256Json(m);
    }

    private static String sha256Json(Map<String, Object> sortedKeysOrder) {
        try {
            byte[] json = MAPPER.writeValueAsString(sortedKeysOrder).getBytes(StandardCharsets.UTF_8);
            return sha256Hex(json);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("audit hash serialization failed", e);
        }
    }

    public static String sha256Hex(byte[] data) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(md.digest(data));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
