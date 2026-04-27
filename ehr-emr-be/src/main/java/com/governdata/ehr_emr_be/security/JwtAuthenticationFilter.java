package com.governdata.ehr_emr_be.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String BEARER = "Bearer ";

    private final JwtProperties jwtProperties;

    public JwtAuthenticationFilter(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (!StringUtils.hasText(authHeader) || !authHeader.startsWith(BEARER)) {
            filterChain.doFilter(request, response);
            return;
        }
        String token = authHeader.substring(BEARER.length()).trim();
        try {
            Claims claims = parseAndValidate(token);
            EhrPrincipal principal = buildPrincipal(claims);
            var authentication = new UsernamePasswordAuthenticationToken(
                    principal,
                    null,
                    principal.getAuthorities());
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (JwtException e) {
            // Leave context empty; downstream will return 401
        }
        filterChain.doFilter(request, response);
    }

    private Claims parseAndValidate(String token) {
        if (jwtProperties.isHs256()) {
            SecretKey key = Keys.hmacShaKeyFor(jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8));
            return Jwts.parser()
                    .verifyWith(key)
                    .requireIssuer(jwtProperties.getIssuer())
                    .requireAudience(jwtProperties.getAudience())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        }
        // RS256 can be added later via PEM public key parsing
        throw new JwtException("JWT not configured: set ehr.security.jwt.secret for HS256");
    }

    private EhrPrincipal buildPrincipal(Claims claims) {
        String sub = claims.getSubject();
        String role = claims.get("role", String.class);
        if ((role == null || role.isBlank()) && claims.get("roles") instanceof List<?> roles && !roles.isEmpty()) {
            role = String.valueOf(roles.get(0));
        }
        Set<String> scopes = toSet(claims.get("scopes", List.class));
        if (scopes.isEmpty()) {
            String singleScope = claims.get("scope", String.class);
            if (singleScope != null && !singleScope.isBlank()) {
                scopes = Set.of(singleScope);
            }
        }
        if (claims.get("roles") instanceof List<?> roles) {
            Set<String> roleScopes = roles.stream()
                    .filter(Objects::nonNull)
                    .map(r -> "role." + r.toString().toLowerCase())
                    .collect(Collectors.toSet());
            if (!roleScopes.isEmpty()) {
                Set<String> merged = new HashSet<>(scopes);
                merged.addAll(roleScopes);
                scopes = merged;
            }
        }
        Set<UUID> patientIds = parsePatientIds(claims.get("patient_ids"));
        String purposeOfUse = claims.get("purpose_of_use", String.class);
        String decisionId = claims.get("decision_id", String.class);
        return new EhrPrincipal(sub, role, scopes, patientIds, purposeOfUse, decisionId);
    }

    private Set<String> toSet(List<?> list) {
        if (list == null) return Set.of();
        return list.stream()
                .filter(Objects::nonNull)
                .map(Object::toString)
                .collect(Collectors.toSet());
    }

    private Set<UUID> parsePatientIds(Object value) {
        if (value == null) return Set.of();
        if (value instanceof List<?> list) {
            return list.stream()
                    .map(o -> {
                        if (o instanceof String s) return parseUuid(s);
                        return null;
                    })
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());
        }
        if (value instanceof String s) {
            UUID u = parseUuid(s);
            return u != null ? Set.of(u) : Set.of();
        }
        return Set.of();
    }

    private static UUID parseUuid(String s) {
        try {
            return UUID.fromString(s);
        } catch (Exception e) {
            return null;
        }
    }
}
