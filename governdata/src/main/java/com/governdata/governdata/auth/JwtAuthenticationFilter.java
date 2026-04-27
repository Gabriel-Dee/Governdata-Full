package com.governdata.governdata.auth;

import com.governdata.governdata.api.dto.ApiErrorResponse;
import com.governdata.governdata.service.auth.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwtService;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getRequestURI().startsWith("/api/v1/portal/");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        String token = null;
        if (header != null && header.startsWith("Bearer ")) {
            token = header.substring(7).trim();
        }
        var claims = jwtService.parseAndValidate(token);
        if (claims.isEmpty()) {
            writeUnauthorized(response, request.getRequestURI());
            return;
        }
        var c = claims.get();
        try {
            PortalAuthContext.set(c.userId(), c.tenantId(), c.email());
            filterChain.doFilter(request, response);
        } finally {
            PortalAuthContext.clear();
        }
    }

    private void writeUnauthorized(HttpServletResponse response, String path) throws IOException {
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        ApiErrorResponse body = ApiErrorResponse.builder()
                .timestamp(Instant.now())
                .status(HttpStatus.UNAUTHORIZED.value())
                .error(HttpStatus.UNAUTHORIZED.getReasonPhrase())
                .message("Missing or invalid Bearer token for portal")
                .path(path)
                .build();
        response.getWriter().write(
                "{\"timestamp\":\"" + body.getTimestamp()
                        + "\",\"status\":401,\"error\":\"Unauthorized\",\"message\":\""
                        + body.getMessage().replace("\"", "\\\"")
                        + "\",\"path\":\"" + path + "\",\"violations\":null}"
        );
    }
}
