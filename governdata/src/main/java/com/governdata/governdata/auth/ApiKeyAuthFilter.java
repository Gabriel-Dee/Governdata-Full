package com.governdata.governdata.auth;

import com.governdata.governdata.api.dto.ApiErrorResponse;
import com.governdata.governdata.service.auth.ApiKeyAuthService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;

@Component
@RequiredArgsConstructor
public class ApiKeyAuthFilter extends OncePerRequestFilter {
    private final ApiKeyAuthService apiKeyAuthService;

    @Value("${governance.auth.api-key.enabled:true}")
    private boolean apiKeyEnabled;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return !apiKeyEnabled
                || path.startsWith("/actuator/")
                || path.startsWith("/api/v1/admin/")
                || path.startsWith("/api/v1/auth/")
                || path.startsWith("/api/v1/portal/");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String rawApiKey = request.getHeader("X-API-Key");
        var principal = apiKeyAuthService.authenticate(rawApiKey);
        if (principal.isEmpty()) {
            writeUnauthorized(response, request.getRequestURI());
            return;
        }

        try {
            TenantRequestContext.set(principal.get());
            filterChain.doFilter(request, response);
        } finally {
            TenantRequestContext.clear();
        }
    }

    private void writeUnauthorized(HttpServletResponse response, String path) throws IOException {
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        ApiErrorResponse body = ApiErrorResponse.builder()
                .timestamp(Instant.now())
                .status(HttpStatus.UNAUTHORIZED.value())
                .error(HttpStatus.UNAUTHORIZED.getReasonPhrase())
                .message("Missing or invalid X-API-Key")
                .path(path)
                .build();
        String payload = "{\"timestamp\":\"" + body.getTimestamp() + "\",\"status\":401,\"error\":\"Unauthorized\",\"message\":\"Missing or invalid X-API-Key\",\"path\":\"" + body.getPath() + "\",\"violations\":null}";
        response.getWriter().write(payload);
    }
}
