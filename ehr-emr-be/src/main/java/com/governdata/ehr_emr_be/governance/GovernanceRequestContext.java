package com.governdata.ehr_emr_be.governance;

import com.governdata.ehr_emr_be.security.CallerIdentity;
import com.governdata.ehr_emr_be.security.EhrPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Optional;
import java.util.UUID;

/**
 * Helper to obtain current caller identity from SecurityContext for building AuthorizationRequest.
 */
public final class GovernanceRequestContext {

    private GovernanceRequestContext() {}

    private static final ThreadLocal<AuthorizationResponse> LAST_AUTHORIZATION = new ThreadLocal<>();

    public static Optional<CallerIdentity> getCallerIdentity() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof CallerIdentity identity) {
            return Optional.of(identity);
        }
        if (auth != null && auth.getPrincipal() instanceof EhrPrincipal principal) {
            try {
                UUID userId = UUID.fromString(principal.getSubject());
                return Optional.of(new CallerIdentity(userId, principal.getPurposeOfUse()));
            } catch (Exception ignored) {
                return Optional.empty();
            }
        }
        return Optional.empty();
    }

    public static UUID getRequiredUserId() {
        return getCallerIdentity()
                .map(CallerIdentity::userId)
                .orElseThrow(() -> new IllegalStateException("No caller identity; ensure JWT or X-User-Id header is set"));
    }

    public static String getPurposeOfUse() {
        String headerValue = getHeader("X-Purpose-Of-Use");
        if (headerValue != null && !headerValue.isBlank()) {
            return headerValue.trim();
        }
        return getCallerIdentity()
                .map(CallerIdentity::purposeOfUseOrDefault)
                .orElse(CallerIdentity.DEFAULT_PURPOSE);
    }

    public static String getRole() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            return null;
        }
        if (auth.getPrincipal() instanceof EhrPrincipal principal) {
            return principal.getRole();
        }
        for (GrantedAuthority authority : auth.getAuthorities()) {
            if (authority.getAuthority() != null && authority.getAuthority().startsWith("ROLE_")) {
                return authority.getAuthority().substring("ROLE_".length());
            }
        }
        return null;
    }

    public static String getDepartment() {
        return getHeader("X-Department");
    }

    public static String getLocation() {
        return getHeader("X-Location");
    }

    public static String getRegion() {
        return getHeader("X-Region");
    }

    public static String getLegalBasis() {
        return getHeader("X-Legal-Basis");
    }

    public static Boolean getConsentGranted() {
        String value = getHeader("X-Consent-Granted");
        if (value == null || value.isBlank()) {
            return null;
        }
        return "true".equalsIgnoreCase(value) || "1".equals(value) || "yes".equalsIgnoreCase(value);
    }

    public static void setLastAuthorization(AuthorizationResponse response) {
        LAST_AUTHORIZATION.set(response);
    }

    public static Optional<AuthorizationResponse> getLastAuthorization() {
        return Optional.ofNullable(LAST_AUTHORIZATION.get());
    }

    public static void clearLastAuthorization() {
        LAST_AUTHORIZATION.remove();
    }

    private static String getHeader(String name) {
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attrs == null) {
            return null;
        }
        HttpServletRequest request = attrs.getRequest();
        if (request == null) {
            return null;
        }
        String value = request.getHeader(name);
        return value != null ? value.trim() : null;
    }
}
