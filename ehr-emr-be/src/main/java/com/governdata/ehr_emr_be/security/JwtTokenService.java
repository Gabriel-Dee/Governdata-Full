package com.governdata.ehr_emr_be.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
public class JwtTokenService {

    private final JwtProperties jwtProperties;

    public JwtTokenService(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
    }

    public String issueToken(UUID userId, String username, List<String> roles, List<String> permissions) {
        Instant now = Instant.now();
        Instant exp = now.plusSeconds(jwtProperties.getExpirationSeconds());
        SecretKey key = Keys.hmacShaKeyFor(jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8));

        return Jwts.builder()
                .subject(userId.toString())
                .issuer(jwtProperties.getIssuer())
                .audience().add(jwtProperties.getAudience()).and()
                .issuedAt(Date.from(now))
                .expiration(Date.from(exp))
                .claim("username", username)
                .claim("roles", roles)
                .claim("scopes", permissions)
                .claim("purpose_of_use", "TREATMENT")
                .signWith(key)
                .compact();
    }

    public long getExpirationSeconds() {
        return jwtProperties.getExpirationSeconds();
    }
}
