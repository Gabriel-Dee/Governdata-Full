package com.governdata.ehr_emr_be.controller;

import com.governdata.ehr_emr_be.patient.Patient;
import com.governdata.ehr_emr_be.patient.PatientService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Controller tests with full application context so the real security chain
 * (CallerIdentityFilter) runs. Only PatientService is mocked.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PatientControllerIntegrationTest {

    private static final String TEST_USER_ID = "11111111-1111-1111-1111-111111111111";

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private PatientService patientService;

    private static Patient patient(UUID id) {
        Patient p = new Patient();
        p.setId(id);
        p.setMrn("MRN-TEST");
        p.setFirstName("Test");
        p.setLastName("User");
        p.setDob(LocalDate.of(1990, 1, 1));
        p.setCreatedAt(OffsetDateTime.now());
        p.setUpdatedAt(OffsetDateTime.now());
        return p;
    }

    @Test
    void getById_returns200_whenUserHeaderPresent() throws Exception {
        UUID id = UUID.fromString("a1b2c3d4-e5f6-4789-a012-000000000001");
        Patient p = patient(id);
        when(patientService.getById(id)).thenReturn(p);

        mockMvc.perform(get("/api/v1/patients/{id}", id).header("X-User-Id", TEST_USER_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.mrn").value("MRN-TEST"))
                .andExpect(jsonPath("$.firstName").value("Test"));
    }

    @Test
    void getById_returns401_withoutUserHeader() throws Exception {
        UUID id = UUID.randomUUID();
        mockMvc.perform(get("/api/v1/patients/{id}", id))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void list_returns200_withPage() throws Exception {
        UUID id = UUID.randomUUID();
        when(patientService.findAll(any())).thenReturn(new PageImpl<>(List.of(patient(id)), PageRequest.of(0, 20), 1));

        mockMvc.perform(get("/api/v1/patients").header("X-User-Id", TEST_USER_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content.length()").value(1));
    }

    @Test
    void create_returns201() throws Exception {
        UUID id = UUID.randomUUID();
        Patient created = patient(id);
        created.setMrn("MRN-NEW");
        when(patientService.create(any(Patient.class))).thenReturn(created);

        String body = """
                {"mrn":"MRN-NEW","firstName":"New","lastName":"Patient","dob":"1995-05-05"}
                """;
        mockMvc.perform(post("/api/v1/patients")
                        .header("X-User-Id", TEST_USER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.mrn").value("MRN-NEW"));
    }
}
