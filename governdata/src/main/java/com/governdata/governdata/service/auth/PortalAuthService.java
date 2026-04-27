package com.governdata.governdata.service.auth;

import com.governdata.governdata.api.dto.portal.*;
import com.governdata.governdata.api.error.ConflictException;
import com.governdata.governdata.persistence.entity.PortalUserEntity;
import com.governdata.governdata.persistence.entity.TenantEntity;
import com.governdata.governdata.persistence.repository.PortalUserRepository;
import com.governdata.governdata.persistence.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.time.Instant;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PortalAuthService {
    private final PortalUserRepository portalUserRepository;
    private final TenantRepository tenantRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);
        if (portalUserRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflictException("Email already registered");
        }

        String tenantKey = allocateTenantKey(request.getTenantKey(), request.getOrganizationDisplayName());
        Instant now = Instant.now();
        TenantEntity tenant = TenantEntity.builder()
                .tenantKey(tenantKey)
                .displayName(request.getOrganizationDisplayName().trim())
                .primaryContactEmail(email)
                .primaryContactName(trimToNull(request.getDisplayName()))
                .primaryContactTitle(null)
                .active(true)
                .updatedAt(now)
                .build();
        tenant = tenantRepository.save(tenant);

        PortalUserEntity user = PortalUserEntity.builder()
                .tenantId(tenant.getId())
                .email(email)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .displayName(trimToNull(request.getDisplayName()))
                .updatedAt(now)
                .build();
        user = portalUserRepository.save(user);

        return buildAuthResponse(user, tenant);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);
        PortalUserEntity user = portalUserRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new SecurityException("Invalid email or password"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new SecurityException("Invalid email or password");
        }
        TenantEntity tenant = tenantRepository.findById(user.getTenantId())
                .orElseThrow(() -> new SecurityException("Invalid email or password"));
        if (!Boolean.TRUE.equals(tenant.getActive())) {
            throw new SecurityException("Organization is inactive");
        }
        return buildAuthResponse(user, tenant);
    }

    private AuthResponse buildAuthResponse(PortalUserEntity user, TenantEntity tenant) {
        String token = jwtService.createAccessToken(user.getId(), tenant.getId(), user.getEmail());
        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .expiresInSeconds(jwtService.getExpirationSeconds())
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
                .build();
    }

    private static String trimToNull(String s) {
        if (s == null || s.isBlank()) {
            return null;
        }
        return s.trim();
    }

    private String allocateTenantKey(String requested, String organizationDisplayName) {
        String base = requested != null && !requested.isBlank()
                ? normalizeTenantKey(requested)
                : slugifyOrganizationName(organizationDisplayName);
        String candidate = base;
        int n = 0;
        while (tenantRepository.findByTenantKey(candidate).isPresent()) {
            n++;
            String suffix = "-" + Integer.toString(n, 36);
            String trimmed = base.length() + suffix.length() > 64
                    ? base.substring(0, Math.max(1, 64 - suffix.length()))
                    : base;
            candidate = trimmed + suffix;
        }
        return candidate;
    }

    private static String normalizeTenantKey(String raw) {
        String s = raw.trim().toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9-]+", "-").replaceAll("^[-]+|[-]+$", "");
        if (s.isEmpty()) {
            throw new IllegalArgumentException("tenantKey must contain letters or numbers");
        }
        if (s.length() > 64) {
            s = s.substring(0, 64).replaceAll("-+$", "");
        }
        return s;
    }

    private static String slugifyOrganizationName(String orgName) {
        if (orgName == null || orgName.isBlank()) {
            return "org-" + UUID.randomUUID().toString().substring(0, 8);
        }
        String s = Normalizer.normalize(orgName.trim(), Normalizer.Form.NFD).replaceAll("\\p{M}", "");
        s = s.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "-").replaceAll("^[-]+|[-]+$", "");
        if (s.isEmpty()) {
            s = "org-" + UUID.randomUUID().toString().substring(0, 8);
        }
        if (s.length() > 64) {
            s = s.substring(0, 64).replaceAll("-+$", "");
        }
        return s;
    }
}
