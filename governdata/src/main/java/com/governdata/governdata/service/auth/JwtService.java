package com.governdata.governdata.service.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;

@Service
public class JwtService {
    public static final String CLAIM_TENANT_ID = "tenantId";
    public static final String CLAIM_EMAIL = "email";

    private final SecretKey key;
    private final long expirationSeconds;

    public JwtService(
            @Value("${governance.portal.jwt.secret}") String secret,
            @Value("${governance.portal.jwt.expiration-seconds:86400}") long expirationSeconds
    ) {
        if (secret == null || secret.length() < 32) {
            throw new IllegalStateException("governance.portal.jwt.secret must be at least 32 characters");
        }
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationSeconds = expirationSeconds;
    }

    public long getExpirationSeconds() {
        return expirationSeconds;
    }

    public String createAccessToken(long userId, long tenantId, String email) {
        Instant now = Instant.now();
        Instant exp = now.plusSeconds(expirationSeconds);
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim(CLAIM_TENANT_ID, tenantId)
                .claim(CLAIM_EMAIL, email)
                .issuedAt(Date.from(now))
                .expiration(Date.from(exp))
                .signWith(key)
                .compact();
    }

    public Optional<PortalJwtClaims> parseAndValidate(String token) {
        if (token == null || token.isBlank()) {
            return Optional.empty();
        }
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            long userId = Long.parseLong(claims.getSubject());
            Number tid = claims.get(CLAIM_TENANT_ID, Number.class);
            if (tid == null) {
                return Optional.empty();
            }
            String email = claims.get(CLAIM_EMAIL, String.class);
            return Optional.of(new PortalJwtClaims(userId, tid.longValue(), email != null ? email : ""));
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public record PortalJwtClaims(long userId, long tenantId, String email) {
    }
}
