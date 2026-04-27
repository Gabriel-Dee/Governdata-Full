package com.governdata.governdata.api.controller;

import com.governdata.governdata.api.dto.admin.*;
import com.governdata.governdata.persistence.entity.TenantEntity;
import com.governdata.governdata.service.auth.ApiKeyProvisioningService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminAuthController {
    private final ApiKeyProvisioningService apiKeyProvisioningService;

    @Value("${governance.auth.admin-secret:change-me-admin-secret}")
    private String adminSecret;

    /**
     * Register a customer organization (hospital, vendor on behalf of hospital, etc.). Called only by platform operators using {@code X-Admin-Secret}, not by tenant end-users.
     */
    @PostMapping(value = "/tenants", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<CreateTenantResponse> createTenant(
            @RequestHeader(value = "X-Admin-Secret", required = false) String providedSecret,
            @Valid @RequestBody CreateTenantRequest request
    ) {
        validateSecret(providedSecret);
        TenantEntity tenant = apiKeyProvisioningService.createTenant(
                request.getTenantKey(),
                request.getDisplayName(),
                request.getPrimaryContactEmail(),
                request.getPrimaryContactName(),
                request.getPrimaryContactTitle()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(CreateTenantResponse.builder()
                .tenantId(tenant.getId())
                .tenantKey(tenant.getTenantKey())
                .displayName(tenant.getDisplayName())
                .primaryContactEmail(tenant.getPrimaryContactEmail())
                .primaryContactName(tenant.getPrimaryContactName())
                .primaryContactTitle(tenant.getPrimaryContactTitle())
                .build());
    }

    /** List all organizations for platform operations / support (same admin secret). */
    @GetMapping(value = "/tenants", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<TenantSummaryResponse>> listTenants(
            @RequestHeader(value = "X-Admin-Secret", required = false) String providedSecret
    ) {
        validateSecret(providedSecret);
        return ResponseEntity.ok(apiKeyProvisioningService.listTenants());
    }

    /** Organization detail and non-secret API key metadata (prefixes only). */
    @GetMapping(value = "/tenants/{tenantId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<TenantDetailResponse> getTenant(
            @RequestHeader(value = "X-Admin-Secret", required = false) String providedSecret,
            @PathVariable Long tenantId
    ) {
        validateSecret(providedSecret);
        return apiKeyProvisioningService.getTenant(tenantId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping(value = "/api-keys", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<IssueApiKeyResponse> issueApiKey(
            @RequestHeader(value = "X-Admin-Secret", required = false) String providedSecret,
            @Valid @RequestBody IssueApiKeyRequest request
    ) {
        validateSecret(providedSecret);
        var issued = apiKeyProvisioningService.issueApiKey(request.getTenantId(), request.getName(), request.getExpiresAt());
        return ResponseEntity.status(HttpStatus.CREATED).body(IssueApiKeyResponse.builder()
                .tenantId(issued.getTenantId())
                .tenantKey(issued.getTenantKey())
                .name(issued.getName())
                .apiKey(issued.getApiKey())
                .keyPrefix(issued.getKeyPrefix())
                .expiresAt(issued.getExpiresAt())
                .build());
    }

    private void validateSecret(String providedSecret) {
        if (providedSecret == null || !providedSecret.equals(adminSecret)) {
            throw new SecurityException("Invalid X-Admin-Secret");
        }
    }
}
