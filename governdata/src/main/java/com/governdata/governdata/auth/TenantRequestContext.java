package com.governdata.governdata.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public final class TenantRequestContext {
    private static final ThreadLocal<Principal> CURRENT = new ThreadLocal<>();

    private TenantRequestContext() {
    }

    public static void set(Principal principal) {
        CURRENT.set(principal);
    }

    public static Principal get() {
        return CURRENT.get();
    }

    public static Long requireTenantId() {
        Principal principal = CURRENT.get();
        if (principal == null || principal.getTenantId() == null) {
            throw new SecurityException("Missing or invalid X-API-Key");
        }
        return principal.getTenantId();
    }

    public static void clear() {
        CURRENT.remove();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Principal {
        private Long tenantId;
        private String tenantKey;
        private String apiKeyName;
    }
}
