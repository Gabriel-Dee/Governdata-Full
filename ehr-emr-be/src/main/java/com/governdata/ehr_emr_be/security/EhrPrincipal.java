package com.governdata.ehr_emr_be.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Principal built from governance-issued JWT claims.
 * Used for method-level access control (roles, scopes, optional patient constraints).
 */
public class EhrPrincipal implements UserDetails {

    private final String subject;
    private final String role;
    private final Set<String> scopes;
    private final Set<UUID> patientIds; // optional fine-grained constraint
    private final String purposeOfUse;
    private final String decisionId;
    private final Collection<? extends GrantedAuthority> authorities;

    public EhrPrincipal(String subject, String role, Set<String> scopes,
                        Set<UUID> patientIds, String purposeOfUse, String decisionId) {
        this.subject = subject;
        this.role = role;
        this.scopes = scopes != null ? Set.copyOf(scopes) : Set.of();
        this.patientIds = patientIds != null ? Set.copyOf(patientIds) : Set.of();
        this.purposeOfUse = purposeOfUse;
        this.decisionId = decisionId;
        this.authorities = buildAuthorities(role, scopes);
    }

    private static Collection<GrantedAuthority> buildAuthorities(String role, Set<String> scopes) {
        List<GrantedAuthority> list = Stream.concat(
                role == null || role.isBlank() ? Stream.empty() : Stream.of(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase())),
                scopes == null ? Stream.empty() : scopes.stream().map(s -> new SimpleGrantedAuthority("SCOPE_" + s))
        ).collect(Collectors.toList());
        return Collections.unmodifiableList(list);
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return null;
    }

    @Override
    public String getUsername() {
        return subject;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    public String getSubject() {
        return subject;
    }

    public String getRole() {
        return role;
    }

    public Set<String> getScopes() {
        return scopes;
    }

    public Set<UUID> getPatientIds() {
        return patientIds;
    }

    public String getPurposeOfUse() {
        return purposeOfUse;
    }

    public String getDecisionId() {
        return decisionId;
    }

    public boolean hasScope(String scope) {
        return scopes != null && scopes.contains(scope);
    }

    public boolean hasRole(String r) {
        return role != null && role.equalsIgnoreCase(r);
    }

    /** If token has patient_ids constraint, check whether access to this patient is allowed. */
    public boolean canAccessPatient(UUID patientId) {
        if (patientIds == null || patientIds.isEmpty()) {
            return true; // no constraint = allow if scope/role allows
        }
        return patientIds.contains(patientId);
    }
}
