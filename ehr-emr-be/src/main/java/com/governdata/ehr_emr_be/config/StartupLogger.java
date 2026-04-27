package com.governdata.ehr_emr_be.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class StartupLogger {

    private static final Logger log = LoggerFactory.getLogger(StartupLogger.class);

    @Value("${server.port:8080}")
    private int serverPort;

    @EventListener(ApplicationReadyEvent.class)
    public void logApplicationUrl() {
        String url = "http://localhost:" + serverPort;
        log.info("Application ready. API base: {}/api/v1  |  Actuator: {}/actuator/health  |  Swagger: {}/swagger-ui.html", url, url, url);
    }
}
