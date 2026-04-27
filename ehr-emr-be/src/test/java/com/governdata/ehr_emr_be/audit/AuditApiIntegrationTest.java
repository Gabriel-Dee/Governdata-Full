package com.governdata.ehr_emr_be.audit;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuditApiIntegrationTest {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Autowired
    private MockMvc mockMvc;

    @Test
    void admin_can_list_audit_events() throws Exception {
        String adminToken = loginToken("admin", "admin123!");
        mockMvc.perform(get("/api/v1/admin/audit-events")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    void clinician_cannot_list_audit_events() throws Exception {
        String token = loginToken("clinician1", "clinician123!");
        mockMvc.perform(get("/api/v1/admin/audit-events")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }

    @Test
    void admin_can_get_emr_import_config() throws Exception {
        String adminToken = loginToken("admin", "admin123!");
        mockMvc.perform(get("/api/v1/admin/import/healthcare-emr-config")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.healthcareCsvPath").exists())
                .andExpect(jsonPath("$.emrMaxRows").exists());
    }

    @Test
    void admin_can_post_emr_csv_import() throws Exception {
        String adminToken = loginToken("admin", "admin123!");
        mockMvc.perform(post("/api/v1/admin/import/healthcare-emr-data?replace=false")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.patientsInserted").exists());
    }

    private String loginToken(String username, String password) throws Exception {
        String body = MAPPER.writeValueAsString(java.util.Map.of("username", username, "password", password));
        String resp = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        JsonNode node = MAPPER.readTree(resp);
        return node.get("accessToken").asText();
    }
}
