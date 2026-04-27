package com.governdata.ehr_emr_be.patient;

import com.governdata.ehr_emr_be.audit.AuditRecordingService;
import com.governdata.ehr_emr_be.exception.ResourceNotFoundException;
import com.governdata.ehr_emr_be.governance.AuthorizationRequest;
import com.governdata.ehr_emr_be.governance.AuthorizationResponse;
import com.governdata.ehr_emr_be.governance.GovernanceAuthorizationFactory;
import com.governdata.ehr_emr_be.governance.GovernanceClient;
import com.governdata.ehr_emr_be.security.CallerIdentity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PatientServiceTest {

    private static final UUID CALLER_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private GovernanceClient governanceClient;

    @Mock
    private GovernanceAuthorizationFactory governanceAuthorizationFactory;

    @Mock
    private AuditRecordingService auditRecordingService;

    @InjectMocks
    private PatientService patientService;

    @BeforeEach
    void setCallerIdentity() {
        CallerIdentity identity = new CallerIdentity(CALLER_ID, "TREATMENT");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(identity, null, List.of()));
        when(governanceAuthorizationFactory.build(any(), any(), any())).thenAnswer(invocation -> {
            UUID patientId = invocation.getArgument(0);
            String resourceType = invocation.getArgument(1);
            String action = invocation.getArgument(2);
            return AuthorizationRequest.of(
                    CALLER_ID,
                    "Doctor",
                    "General",
                    patientId,
                    resourceType,
                    action,
                    "TREATMENT",
                    "hospital",
                    Map.of("legalBasis", "HIPAA", "region", "US", "tenantId", "test"));
        });
    }

    private static Patient patient(UUID id, String mrn) {
        Patient p = new Patient();
        p.setId(id);
        p.setMrn(mrn);
        p.setFirstName("Test");
        p.setLastName("User");
        p.setDob(LocalDate.of(1990, 1, 1));
        p.setCreatedAt(OffsetDateTime.now());
        p.setUpdatedAt(OffsetDateTime.now());
        return p;
    }

    @Test
    void getById_returnsPatient_whenFound() {
        UUID id = UUID.randomUUID();
        Patient p = patient(id, "MRN-TEST");
        when(governanceClient.authorize(any())).thenReturn(AuthorizationResponse.allow("test", null));
        when(patientRepository.findById(id)).thenReturn(Optional.of(p));

        Patient result = patientService.getById(id);

        assertThat(result).isSameAs(p);
        verify(patientRepository).findById(id);
    }

    @Test
    void getById_throwsResourceNotFoundException_whenMissing() {
        UUID id = UUID.randomUUID();
        when(governanceClient.authorize(any())).thenReturn(AuthorizationResponse.allow("test", null));
        when(patientRepository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> patientService.getById(id))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Patient").hasMessageContaining(id.toString());
        verify(patientRepository).findById(id);
    }

    @Test
    void getById_throwsAccessDenied_whenGovernanceDenies() {
        UUID id = UUID.randomUUID();
        when(governanceClient.authorize(any())).thenReturn(AuthorizationResponse.deny("Policy denied"));

        assertThatThrownBy(() -> patientService.getById(id))
                .isInstanceOf(org.springframework.security.access.AccessDeniedException.class);
    }

    @Test
    void findAll_returnsPage() {
        PageRequest pageable = PageRequest.of(0, 10);
        Patient p = patient(UUID.randomUUID(), "MRN-1");
        when(governanceClient.authorize(any())).thenReturn(AuthorizationResponse.allow("test", null));
        when(patientRepository.findAll(pageable)).thenReturn(new PageImpl<>(List.of(p), pageable, 1));

        Page<Patient> result = patientService.findAll(pageable);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getMrn()).isEqualTo("MRN-1");
        verify(patientRepository).findAll(pageable);
    }

    @Test
    void create_persistsAndReturnsPatient() {
        Patient p = patient(null, "MRN-NEW");
        when(governanceClient.authorize(any())).thenReturn(AuthorizationResponse.allow("test", null));
        when(patientRepository.save(any(Patient.class))).thenAnswer(inv -> {
            Patient saved = inv.getArgument(0);
            if (saved.getId() == null) {
                saved.setId(UUID.randomUUID());
            }
            return saved;
        });

        Patient result = patientService.create(p);

        assertThat(result).isNotNull();
        verify(patientRepository).save(p);
    }

    @Test
    void update_updatesAndReturnsPatient() {
        UUID id = UUID.randomUUID();
        Patient existing = patient(id, "MRN-1");
        Patient updates = new Patient();
        updates.setFirstName("Updated");
        when(governanceClient.authorize(any())).thenReturn(AuthorizationResponse.allow("test", null));
        when(patientRepository.findById(id)).thenReturn(Optional.of(existing));
        when(patientRepository.save(any(Patient.class))).thenAnswer(inv -> inv.getArgument(0));

        Patient result = patientService.update(id, updates);

        assertThat(result.getFirstName()).isEqualTo("Updated");
        verify(patientRepository).save(existing);
    }
}
