package com.governdata.ehr_emr_be.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "ehr.security")
public class SecurityProperties {

    private boolean requireJwt = true;

    public boolean isRequireJwt() {
        return requireJwt;
    }

    public void setRequireJwt(boolean requireJwt) {
        this.requireJwt = requireJwt;
    }
}
