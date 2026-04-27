package com.governdata.ehr_emr_be.governance;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "governance.client")
public class GovernanceClientProperties {

    private String baseUrl = "http://localhost:8081";
    private int timeoutMs = 5000;
    private boolean enabled = true;
    private String apiKey;
    private boolean auditIngestEnabled = true;
    private String sourceSystem = "ehr-emr-be";
    private String tenantKey = "ehremr";
    private String defaultRegion = "US";
    private String defaultLegalBasis = "HIPAA";
    private String defaultDepartment = "General";
    private String defaultLocation = "hospital";
    private boolean defaultConsentGranted = true;
    /**
     * When false, treat governance errors (timeout, 5xx) as deny. When true, allow on error (fail-open).
     */
    private boolean failOpen = false;

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public int getTimeoutMs() {
        return timeoutMs;
    }

    public void setTimeoutMs(int timeoutMs) {
        this.timeoutMs = timeoutMs;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public boolean isAuditIngestEnabled() {
        return auditIngestEnabled;
    }

    public void setAuditIngestEnabled(boolean auditIngestEnabled) {
        this.auditIngestEnabled = auditIngestEnabled;
    }

    public String getSourceSystem() {
        return sourceSystem;
    }

    public void setSourceSystem(String sourceSystem) {
        this.sourceSystem = sourceSystem;
    }

    public String getTenantKey() {
        return tenantKey;
    }

    public void setTenantKey(String tenantKey) {
        this.tenantKey = tenantKey;
    }

    public String getDefaultRegion() {
        return defaultRegion;
    }

    public void setDefaultRegion(String defaultRegion) {
        this.defaultRegion = defaultRegion;
    }

    public String getDefaultLegalBasis() {
        return defaultLegalBasis;
    }

    public void setDefaultLegalBasis(String defaultLegalBasis) {
        this.defaultLegalBasis = defaultLegalBasis;
    }

    public String getDefaultDepartment() {
        return defaultDepartment;
    }

    public void setDefaultDepartment(String defaultDepartment) {
        this.defaultDepartment = defaultDepartment;
    }

    public String getDefaultLocation() {
        return defaultLocation;
    }

    public void setDefaultLocation(String defaultLocation) {
        this.defaultLocation = defaultLocation;
    }

    public boolean isDefaultConsentGranted() {
        return defaultConsentGranted;
    }

    public void setDefaultConsentGranted(boolean defaultConsentGranted) {
        this.defaultConsentGranted = defaultConsentGranted;
    }

    public boolean isFailOpen() {
        return failOpen;
    }

    public void setFailOpen(boolean failOpen) {
        this.failOpen = failOpen;
    }
}
