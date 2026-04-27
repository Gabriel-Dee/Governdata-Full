package com.governdata.governdata.config;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * Loads a project-root {@code .env} into JVM system properties so {@code ${DB_USERNAME}} etc. in
 * {@code application.yml} resolve. Spring Boot does not read {@code .env} by default; real OS env
 * vars always win (we skip keys that are already set).
 */
public final class DotEnvLoader {
    private DotEnvLoader() {
    }

    public static void loadIfPresent() {
        Path env = Path.of(".env");
        if (!Files.isRegularFile(env)) {
            return;
        }
        try {
            for (String line : Files.readAllLines(env)) {
                String trimmed = line.trim();
                if (trimmed.isEmpty() || trimmed.startsWith("#")) {
                    continue;
                }
                int eq = trimmed.indexOf('=');
                if (eq <= 0) {
                    continue;
                }
                String key = trimmed.substring(0, eq).trim();
                if (key.isEmpty()) {
                    continue;
                }
                if (System.getenv(key) != null || System.getProperty(key) != null) {
                    continue;
                }
                String value = trimmed.substring(eq + 1).trim();
                if (value.length() >= 2
                        && ((value.startsWith("\"") && value.endsWith("\""))
                        || (value.startsWith("'") && value.endsWith("'")))) {
                    value = value.substring(1, value.length() - 1);
                }
                System.setProperty(key, value);
            }
        } catch (IOException e) {
            throw new IllegalStateException("Failed to read .env from " + env.toAbsolutePath(), e);
        }
    }
}
