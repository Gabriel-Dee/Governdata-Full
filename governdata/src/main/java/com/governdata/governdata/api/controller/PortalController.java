package com.governdata.governdata.api.controller;

import com.governdata.governdata.api.dto.admin.IssueApiKeyResponse;
import com.governdata.governdata.api.dto.portal.*;
import com.governdata.governdata.auth.PortalAuthContext;
import com.governdata.governdata.persistence.entity.PortalUserEntity;
import com.governdata.governdata.persistence.entity.TenantEntity;
import com.governdata.governdata.persistence.repository.PortalUserRepository;
import com.governdata.governdata.persistence.repository.TenantRepository;
import com.governdata.governdata.service.auth.ApiKeyProvisioningService;
import com.governdata.governdata.service.portal.CodeSnippetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/portal")
@RequiredArgsConstructor
public class PortalController {

    private final PortalUserRepository portalUserRepository;
    private final TenantRepository tenantRepository;
    private final ApiKeyProvisioningService apiKeyProvisioningService;
    private final CodeSnippetService codeSnippetService;

    @GetMapping(value = "/me", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<PortalMeResponse> me() {
        var ctx = PortalAuthContext.getRequired();
        PortalUserEntity user = portalUserRepository.findById(ctx.getUserId())
                .orElseThrow(() -> new SecurityException("User not found"));
        TenantEntity tenant = tenantRepository.findById(ctx.getTenantId())
                .orElseThrow(() -> new SecurityException("Organization not found"));
        return ResponseEntity.ok(PortalMeResponse.builder()
                .tenant(TenantInfoDto.builder()
                        .tenantId(tenant.getId())
                        .tenantKey(tenant.getTenantKey())
                        .displayName(tenant.getDisplayName())
                        .build())
                .user(UserInfoDto.builder()
                        .userId(user.getId())
                        .email(user.getEmail())
                        .displayName(user.getDisplayName())
                        .build())
                .build());
    }

    @GetMapping(value = "/api-keys", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<PortalApiKeySummaryResponse>> listApiKeys() {
        long tenantId = PortalAuthContext.getRequired().getTenantId();
        return ResponseEntity.ok(apiKeyProvisioningService.listPortalApiKeys(tenantId));
    }

    @PostMapping(value = "/api-keys", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<IssueApiKeyResponse> createApiKey(@Valid @RequestBody CreatePortalApiKeyRequest request) {
        long tenantId = PortalAuthContext.getRequired().getTenantId();
        var issued = apiKeyProvisioningService.issueApiKey(tenantId, request.getName(), request.getExpiresAt());
        return ResponseEntity.status(HttpStatus.CREATED).body(IssueApiKeyResponse.builder()
                .tenantId(issued.getTenantId())
                .tenantKey(issued.getTenantKey())
                .name(issued.getName())
                .apiKey(issued.getApiKey())
                .keyPrefix(issued.getKeyPrefix())
                .expiresAt(issued.getExpiresAt())
                .build());
    }

    @DeleteMapping(value = "/api-keys/{keyId}")
    public ResponseEntity<Void> revokeApiKey(@PathVariable Long keyId) {
        long tenantId = PortalAuthContext.getRequired().getTenantId();
        apiKeyProvisioningService.revokeApiKey(tenantId, keyId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping(value = "/code-snippets", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<CodeSnippetsResponse> codeSnippets() {
        PortalAuthContext.getRequired();
        return ResponseEntity.ok(codeSnippetService.buildSnippets());
    }
}
