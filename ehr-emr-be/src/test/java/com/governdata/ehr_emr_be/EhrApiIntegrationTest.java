package com.governdata.ehr_emr_be;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Full application integration test with test profile (H2, governance disabled).
 * Send X-User-Id header for protected endpoints.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class EhrApiIntegrationTest {

    private static final String TEST_USER_ID = "11111111-1111-1111-1111-111111111111";
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    @Autowired
    private MockMvc mockMvc;

    @Test
    void health_isPublic() throws Exception {
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk());
    }

    @Test
    void info_returns200_withUserHeader() throws Exception {
        mockMvc.perform(get("/api/v1/info").header("X-User-Id", TEST_USER_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.application").exists());
    }

    @Test
    void info_returns401_withoutUserHeader() throws Exception {
        mockMvc.perform(get("/api/v1/info"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getPatient_returns404_whenNotFound() throws Exception {
        UUID id = UUID.randomUUID();
        mockMvc.perform(get("/api/v1/patients/{id}", id).header("X-User-Id", TEST_USER_ID))
                .andExpect(status().isNotFound());
    }

    @Test
    void createPatient_thenGet_returns200() throws Exception {
        String createBody = """
                {"mrn":"MRN-INT-TEST","firstName":"Integration","lastName":"Test","dob":"1990-01-15"}
                """;
        ResultActions create = mockMvc.perform(post("/api/v1/patients")
                        .header("X-User-Id", TEST_USER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createBody));
        create.andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.mrn").value("MRN-INT-TEST"));
        String responseBody = create.andReturn().getResponse().getContentAsString();
        JsonNode node = OBJECT_MAPPER.readTree(responseBody);
        String id = node.get("id").asText();
        mockMvc.perform(get("/api/v1/patients/{id}", id).header("X-User-Id", TEST_USER_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Integration"));
    }

    @Test
    void listEncounters_all_returns200() throws Exception {
        mockMvc.perform(get("/api/v1/encounters").header("X-User-Id", TEST_USER_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.totalElements").exists());
    }

    @Test
    void listDiagnoses_all_returns200() throws Exception {
        mockMvc.perform(get("/api/v1/diagnoses").header("X-User-Id", TEST_USER_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.totalElements").exists());
    }

    @Test
    void listMedications_all_returns200() throws Exception {
        mockMvc.perform(get("/api/v1/medications").header("X-User-Id", TEST_USER_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.totalElements").exists());
    }

    @Test
    void updateEncounter_forPatient_returns200() throws Exception {
        String patientBody = """
                {"mrn":"MRN-ENC-UPD","firstName":"Enc","lastName":"Upd","dob":"1991-01-15"}
                """;
        String patientResp = mockMvc.perform(post("/api/v1/patients")
                        .header("X-User-Id", TEST_USER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(patientBody))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String patientId = OBJECT_MAPPER.readTree(patientResp).get("id").asText();

        String encounterBody = """
                {"encounterDate":"2025-01-10T10:30:00Z","type":"OUTPATIENT","reason":"Initial","providerId":"PROV-1","location":"Wing A"}
                """;
        String encounterResp = mockMvc.perform(post("/api/v1/patients/{patientId}/encounters", patientId)
                        .header("X-User-Id", TEST_USER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(encounterBody))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String encounterId = OBJECT_MAPPER.readTree(encounterResp).get("id").asText();

        String updateBody = """
                {"encounterDate":"2025-01-11T10:30:00Z","type":"INPATIENT","reason":"Follow-up","providerId":"PROV-2","location":"Wing B"}
                """;
        mockMvc.perform(put("/api/v1/patients/{patientId}/encounters/{encounterId}", patientId, encounterId)
                        .header("X-User-Id", TEST_USER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(encounterId))
                .andExpect(jsonPath("$.type").value("INPATIENT"))
                .andExpect(jsonPath("$.reason").value("Follow-up"));
    }

    @Test
    void updateDiagnosis_forPatient_returns200() throws Exception {
        String patientBody = """
                {"mrn":"MRN-DX-UPD","firstName":"Dx","lastName":"Upd","dob":"1992-02-15"}
                """;
        String patientResp = mockMvc.perform(post("/api/v1/patients")
                        .header("X-User-Id", TEST_USER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(patientBody))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String patientId = OBJECT_MAPPER.readTree(patientResp).get("id").asText();

        String diagnosisBody = """
                {"code":"A100","description":"Initial diagnosis","onsetDate":"2025-01-10","resolvedDate":null}
                """;
        String diagnosisResp = mockMvc.perform(post("/api/v1/patients/{patientId}/diagnoses", patientId)
                        .header("X-User-Id", TEST_USER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(diagnosisBody))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String diagnosisId = OBJECT_MAPPER.readTree(diagnosisResp).get("id").asText();

        String updateBody = """
                {"code":"B200","description":"Updated diagnosis","onsetDate":"2025-01-11","resolvedDate":"2025-01-20"}
                """;
        mockMvc.perform(put("/api/v1/patients/{patientId}/diagnoses/{diagnosisId}", patientId, diagnosisId)
                        .header("X-User-Id", TEST_USER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(diagnosisId))
                .andExpect(jsonPath("$.code").value("B200"))
                .andExpect(jsonPath("$.description").value("Updated diagnosis"));
    }

    @Test
    void updateMedication_forPatient_returns200() throws Exception {
        String patientBody = """
                {"mrn":"MRN-MED-UPD","firstName":"Med","lastName":"Upd","dob":"1993-03-15"}
                """;
        String patientResp = mockMvc.perform(post("/api/v1/patients")
                        .header("X-User-Id", TEST_USER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(patientBody))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String patientId = OBJECT_MAPPER.readTree(patientResp).get("id").asText();

        String medicationBody = """
                {"drugName":"Atorvastatin","dose":"10mg","route":"oral","frequency":"daily","startDate":"2025-01-10","endDate":null,"prescribingProviderId":"PROV-1"}
                """;
        String medicationResp = mockMvc.perform(post("/api/v1/patients/{patientId}/medications", patientId)
                        .header("X-User-Id", TEST_USER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(medicationBody))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String medicationId = OBJECT_MAPPER.readTree(medicationResp).get("id").asText();

        String updateBody = """
                {"drugName":"Rosuvastatin","dose":"20mg","route":"oral","frequency":"nightly","startDate":"2025-01-11","endDate":"2025-02-11","prescribingProviderId":"PROV-2"}
                """;
        mockMvc.perform(put("/api/v1/patients/{patientId}/medications/{medicationId}", patientId, medicationId)
                        .header("X-User-Id", TEST_USER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(medicationId))
                .andExpect(jsonPath("$.drugName").value("Rosuvastatin"))
                .andExpect(jsonPath("$.frequency").value("nightly"));
    }
}
