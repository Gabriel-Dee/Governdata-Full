package com.governdata.ehr_emr_be.config;

import com.governdata.ehr_emr_be.governance.GovernanceRequestContext;
import com.governdata.ehr_emr_be.security.CallerIdentity;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Logs request metadata (path, status, user) for correlation with governance logs.
 * Does not log PHI or request body.
 */
public class RequestLoggingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RequestLoggingFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            filterChain.doFilter(request, response);
            if (request.getRequestURI().startsWith("/api/v1/")) {
                String userId = null;
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && auth.getPrincipal() instanceof CallerIdentity identity) {
                    userId = identity.userId().toString();
                }
                log.debug("request path={} method={} status={} userId={}",
                        request.getRequestURI(),
                        request.getMethod(),
                        response.getStatus(),
                        userId != null ? userId : "-");
            }
        } finally {
            GovernanceRequestContext.clearLastAuthorization();
        }
    }
}
