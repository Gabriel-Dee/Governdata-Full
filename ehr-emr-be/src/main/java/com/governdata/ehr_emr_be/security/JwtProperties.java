package com.governdata.ehr_emr_be.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "ehr.security.jwt")
public class JwtProperties {

    private String issuer = "health-centre-ehr";
    private String audience = "ehr-backend";
    private String secret = "change-me-local-dev-secret-key-change-me-12345";
    private String publicKey;
    private long expirationSeconds = 3600;

    public String getIssuer() {
        return issuer;
    }

    public void setIssuer(String issuer) {
        this.issuer = issuer;
    }

    public String getAudience() {
        return audience;
    }

    public void setAudience(String audience) {
        this.audience = audience;
    }

    public String getSecret() {
        return secret;
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }

    public String getPublicKey() {
        return publicKey;
    }

    public void setPublicKey(String publicKey) {
        this.publicKey = publicKey;
    }

    public boolean isHs256() {
        return secret != null && !secret.isBlank();
    }

    public boolean isRs256() {
        return publicKey != null && !publicKey.isBlank();
    }

    public long getExpirationSeconds() {
        return expirationSeconds;
    }

    public void setExpirationSeconds(long expirationSeconds) {
        this.expirationSeconds = expirationSeconds;
    }
}
