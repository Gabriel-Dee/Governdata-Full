package com.governdata.governdata.service.auth;

import com.governdata.governdata.api.dto.admin.ApiKeySummaryForAdmin;
import com.governdata.governdata.api.dto.portal.PortalApiKeySummaryResponse;
import com.governdata.governdata.api.dto.admin.TenantDetailResponse;
import com.governdata.governdata.api.dto.admin.TenantSummaryResponse;
import com.governdata.governdata.persistence.entity.ApiKeyEntity;
import com.governdata.governdata.persistence.entity.TenantEntity;
import com.governdata.governdata.persistence.repository.ApiKeyRepository;
import com.governdata.governdata.persistence.repository.TenantRepository;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ApiKeyProvisioningService {
    private static final SecureRandom RNG = new SecureRandom();

    private final TenantRepository tenantRepository;
    private final ApiKeyRepository apiKeyRepository;

    @Transactional
    public TenantEntity createTenant(
            String tenantKey,
            String displayName,
            String primaryContactEmail,
            String primaryContactName,
            String primaryContactTitle
    ) {
        tenantRepository.findByTenantKey(tenantKey).ifPresent(existing -> {
            throw new IllegalArgumentException("tenantKey already exists");
        });
        Instant now = Instant.now();
        TenantEntity tenant = TenantEntity.builder()
                .tenantKey(tenantKey)
                .displayName(displayName)
                .primaryContactEmail(emptyToNull(primaryContactEmail))
                .primaryContactName(emptyToNull(primaryContactName))
                .primaryContactTitle(emptyToNull(primaryContactTitle))
                .active(true)
                .updatedAt(now)
                .build();
        return tenantRepository.save(tenant);
    }

    @Transactional(readOnly = true)
    public List<TenantSummaryResponse> listTenants() {
        return tenantRepository.findAll(Sort.by(Sort.Direction.ASC, "id")).stream()
                .map(t -> TenantSummaryResponse.builder()
                        .tenantId(t.getId())
                        .tenantKey(t.getTenantKey())
                        .displayName(t.getDisplayName())
                        .active(Boolean.TRUE.equals(t.getActive()))
                        .primaryContactEmail(t.getPrimaryContactEmail())
                        .primaryContactName(t.getPrimaryContactName())
                        .primaryContactTitle(t.getPrimaryContactTitle())
                        .createdAt(t.getCreatedAt())
                        .activeApiKeyCount(apiKeyRepository.countByTenantIdAndActiveTrue(t.getId()))
                        .build())
                .toList();
    }

    @Transactional(readOnly = true)
    public Optional<TenantDetailResponse> getTenant(Long tenantId) {
        return tenantRepository.findById(tenantId).map(t -> {
            List<ApiKeySummaryForAdmin> keys = apiKeyRepository.findByTenantIdOrderByIdAsc(tenantId).stream()
                    .map(k -> ApiKeySummaryForAdmin.builder()
                            .keyId(k.getId())
                            .name(k.getName())
                            .keyPrefix(k.getKeyPrefix())
                            .active(Boolean.TRUE.equals(k.getActive()))
                            .expiresAt(k.getExpiresAt())
                            .lastUsedAt(k.getLastUsedAt())
                            .createdAt(k.getCreatedAt())
                            .build())
                    .toList();
            return TenantDetailResponse.builder()
                    .tenantId(t.getId())
                    .tenantKey(t.getTenantKey())
                    .displayName(t.getDisplayName())
                    .active(Boolean.TRUE.equals(t.getActive()))
                    .primaryContactEmail(t.getPrimaryContactEmail())
                    .primaryContactName(t.getPrimaryContactName())
                    .primaryContactTitle(t.getPrimaryContactTitle())
                    .createdAt(t.getCreatedAt())
                    .updatedAt(t.getUpdatedAt())
                    .apiKeys(keys)
                    .build();
        });
    }

    private static String emptyToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }

    @Transactional(readOnly = true)
    public List<PortalApiKeySummaryResponse> listPortalApiKeys(Long tenantId) {
        return apiKeyRepository.findByTenantIdOrderByIdAsc(tenantId).stream()
                .map(k -> PortalApiKeySummaryResponse.builder()
                        .keyId(k.getId())
                        .name(k.getName())
                        .keyPrefix(k.getKeyPrefix())
                        .active(Boolean.TRUE.equals(k.getActive()))
                        .expiresAt(k.getExpiresAt())
                        .lastUsedAt(k.getLastUsedAt())
                        .createdAt(k.getCreatedAt())
                        .build())
                .toList();
    }

    @Transactional
    public void revokeApiKey(Long tenantId, Long keyId) {
        ApiKeyEntity entity = apiKeyRepository.findByIdAndTenantId(keyId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("API key not found"));
        entity.setActive(false);
        apiKeyRepository.save(entity);
    }

    @Transactional
    public IssuedKey issueApiKey(Long tenantId, String name, Instant expiresAt) {
        TenantEntity tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("tenant not found"));

        String raw = generateRawKey();
        String hash = sha256(raw);
        String prefix = raw.substring(0, Math.min(raw.length(), 12));

        ApiKeyEntity entity = ApiKeyEntity.builder()
                .tenantId(tenantId)
                .name(name)
                .keyPrefix(prefix)
                .keyHash(hash)
                .active(true)
                .expiresAt(expiresAt)
                .build();
        apiKeyRepository.save(entity);

        return IssuedKey.builder()
                .tenantId(tenant.getId())
                .tenantKey(tenant.getTenantKey())
                .name(name)
                .apiKey(raw)
                .keyPrefix(prefix)
                .expiresAt(expiresAt)
                .build();
    }

    private static String generateRawKey() {
        byte[] bytes = new byte[32];
        RNG.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        return "gdk_" + token;
    }

    private static String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] out = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(out);
        } catch (Exception e) {
            throw new RuntimeException("Unable to hash API key", e);
        }
    }

    @Data
    @Builder
    public static class IssuedKey {
        private Long tenantId;
        private String tenantKey;
        private String name;
        private String apiKey;
        private String keyPrefix;
        private Instant expiresAt;
    }
}
