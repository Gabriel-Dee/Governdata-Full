package com.governdata.governdata.debug;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.HashMap;
import java.util.Map;

public final class RuntimeDebugLogger {

    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final Path LOG_PATH = Path.of("/Users/gabriel/Projects/Governdata/governdata/.cursor/debug-0016e2.log");

    private RuntimeDebugLogger() {}

    public static void log(String runId, String hypothesisId, String location, String message, Map<String, Object> data) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("sessionId", "0016e2");
            payload.put("runId", runId);
            payload.put("hypothesisId", hypothesisId);
            payload.put("location", location);
            payload.put("message", message);
            payload.put("data", data);
            payload.put("timestamp", System.currentTimeMillis());
            Files.writeString(LOG_PATH, MAPPER.writeValueAsString(payload) + "\n", StandardOpenOption.CREATE, StandardOpenOption.APPEND);
        } catch (Exception ignored) {
        }
    }
}
