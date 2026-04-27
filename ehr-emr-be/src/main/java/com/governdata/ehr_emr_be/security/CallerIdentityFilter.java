package com.governdata.ehr_emr_be.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

/**
 * Reads X-User-Id (required) and X-Purpose-Of-Use (optional) from the request
 * and sets a CallerIdentity principal so the service layer can build AuthorizationRequest.
 * No JWT; governance is called synchronously by the backend.
 */
@Component
public class CallerIdentityFilter extends OncePerRequestFilter {

    public static final String HEADER_USER_ID = "X-User-Id";
    public static final String HEADER_PURPOSE_OF_USE = "X-Purpose-Of-Use";
    private static final List<SimpleGrantedAuthority> HEADER_MODE_AUTHORITIES = List.of(
            new SimpleGrantedAuthority("SCOPE_patient.read"),
            new SimpleGrantedAuthority("SCOPE_patient.list"),
            new SimpleGrantedAuthority("SCOPE_patient.create"),
            new SimpleGrantedAuthority("SCOPE_patient.update"),
            new SimpleGrantedAuthority("SCOPE_encounter.read"),
            new SimpleGrantedAuthority("SCOPE_encounter.create"),
            new SimpleGrantedAuthority("SCOPE_diagnosis.read"),
            new SimpleGrantedAuthority("SCOPE_diagnosis.create"),
            new SimpleGrantedAuthority("SCOPE_medication.read"),
            new SimpleGrantedAuthority("SCOPE_medication.create")
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        Authentication existing = SecurityContextHolder.getContext().getAuthentication();
        if (existing != null && existing.isAuthenticated()) {
            filterChain.doFilter(request, response);
            return;
        }
        String userIdHeader = request.getHeader(HEADER_USER_ID);
        if (StringUtils.hasText(userIdHeader)) {
            try {
                UUID userId = UUID.fromString(userIdHeader.trim());
                String purposeOfUse = request.getHeader(HEADER_PURPOSE_OF_USE);
                CallerIdentity identity = new CallerIdentity(userId, purposeOfUse);
                var authentication = new UsernamePasswordAuthenticationToken(
                        identity,
                        null,
                        HEADER_MODE_AUTHORITIES);
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } catch (IllegalArgumentException e) {
                // Invalid UUID; leave context empty so 401 is returned
            }
        }
        filterChain.doFilter(request, response);
    }
}
