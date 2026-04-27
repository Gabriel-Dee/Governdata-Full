package com.governdata.ehr_emr_be.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;

/**
 * When JWT is disabled (ehr.security.require-jwt=false), sets a full-access principal
 * so that @PreAuthorize checks pass for local smoke tests.
 */
public class OpenModeAuthenticationFilter extends OncePerRequestFilter {

    private static final EhrPrincipal OPEN_PRINCIPAL = new EhrPrincipal(
            "open-mode",
            "ADMIN",
            Set.of("ehr.read", "ehr.write"),
            null,
            null,
            null
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        var authentication = new UsernamePasswordAuthenticationToken(
                OPEN_PRINCIPAL,
                null,
                OPEN_PRINCIPAL.getAuthorities());
        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authentication);
        filterChain.doFilter(request, response);
    }
}
