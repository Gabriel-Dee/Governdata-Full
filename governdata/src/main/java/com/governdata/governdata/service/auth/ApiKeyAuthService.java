package com.governdata.governdata.service.auth;

import com.governdata.governdata.auth.TenantRequestContext;
import com.governdata.governdata.persistence.entity.ApiKeyEntity;
import com.governdata.governdata.persistence.entity.TenantEntity;
import com.governdata.governdata.persistence.repository.ApiKeyRepository;
import com.governdata.governdata.persistence.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ApiKeyAuthService {
    private final ApiKeyRepository apiKeyRepository;
    private final TenantRepository tenantRepository;

    @Transactional
    public Optional<TenantRequestContext.Principal> authenticate(String rawApiKey) {
        if (rawApiKey == null || rawApiKey.isBlank()) {
            return Optional.empty();
        }

        String hash = sha256(rawApiKey);
        Optional<ApiKeyEntity> keyOpt = apiKeyRepository.findByKeyHashAndActiveTrue(hash);
        if (keyOpt.isEmpty()) {
            return Optional.empty();
        }

        ApiKeyEntity key = keyOpt.get();
        if (key.getExpiresAt() != null && key.getExpiresAt().isBefore(Instant.now())) {
            return Optional.empty();
        }

        Optional<TenantEntity> tenantOpt = tenantRepository.findById(key.getTenantId());
        if (tenantOpt.isEmpty() || !Boolean.TRUE.equals(tenantOpt.get().getActive())) {
            return Optional.empty();
        }

        key.setLastUsedAt(Instant.now());
        apiKeyRepository.save(key);

        return Optional.of(TenantRequestContext.Principal.builder()
                .tenantId(tenantOpt.get().getId())
                .tenantKey(tenantOpt.get().getTenantKey())
                .apiKeyName(key.getName())
                .build());
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
}
