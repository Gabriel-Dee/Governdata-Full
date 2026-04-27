package com.governdata.ehr_emr_be.security;

import org.junit.jupiter.api.Test;

import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class EhrPrincipalTest {

    @Test
    void buildAuthorities_includesRoleAndScopes() {
        EhrPrincipal p = new EhrPrincipal("sub1", "DOCTOR", Set.of("ehr.read", "ehr.write"), null, null, null);

        assertThat(p.getAuthorities())
                .extracting(a -> a.getAuthority())
                .containsExactlyInAnyOrder("ROLE_DOCTOR", "SCOPE_ehr.read", "SCOPE_ehr.write");
        assertThat(p.hasScope("ehr.read")).isTrue();
        assertThat(p.hasScope("ehr.write")).isTrue();
        assertThat(p.hasRole("DOCTOR")).isTrue();
        assertThat(p.getSubject()).isEqualTo("sub1");
    }

    @Test
    void canAccessPatient_whenNoConstraint_returnsTrue() {
        EhrPrincipal p = new EhrPrincipal("sub1", "DOCTOR", Set.of("ehr.read"), null, null, null);
        assertThat(p.canAccessPatient(UUID.randomUUID())).isTrue();
    }

    @Test
    void canAccessPatient_whenConstraintAndMatch_returnsTrue() {
        UUID allowed = UUID.randomUUID();
        EhrPrincipal p = new EhrPrincipal("sub1", "DOCTOR", Set.of("ehr.read"), Set.of(allowed), null, null);
        assertThat(p.canAccessPatient(allowed)).isTrue();
    }

    @Test
    void canAccessPatient_whenConstraintAndNoMatch_returnsFalse() {
        UUID allowed = UUID.randomUUID();
        EhrPrincipal p = new EhrPrincipal("sub1", "DOCTOR", Set.of("ehr.read"), Set.of(allowed), null, null);
        assertThat(p.canAccessPatient(UUID.randomUUID())).isFalse();
    }
}
