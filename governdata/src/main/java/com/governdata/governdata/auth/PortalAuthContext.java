package com.governdata.governdata.auth;

import lombok.Builder;
import lombok.Data;

/**
 * Authenticated portal user (JWT). Cleared per request after {@link com.governdata.governdata.auth.JwtAuthenticationFilter}.
 */
public final class PortalAuthContext {
    private static final ThreadLocal<Holder> CTX = new ThreadLocal<>();

    private PortalAuthContext() {
    }

    public static void set(Long userId, Long tenantId, String email) {
        CTX.set(Holder.builder().userId(userId).tenantId(tenantId).email(email).build());
    }

    public static Holder getRequired() {
        Holder h = CTX.get();
        if (h == null) {
            throw new IllegalStateException("No portal user in context");
        }
        return h;
    }

    public static void clear() {
        CTX.remove();
    }

    @Data
    @Builder
    public static class Holder {
        private Long userId;
        private Long tenantId;
        private String email;
    }
}
