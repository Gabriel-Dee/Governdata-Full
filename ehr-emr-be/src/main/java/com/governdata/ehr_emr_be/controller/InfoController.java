package com.governdata.ehr_emr_be.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class InfoController {

    @Value("${spring.application.name:ehr-emr-be}")
    private String applicationName;

    @GetMapping("/info")
    public ResponseEntity<Map<String, String>> info() {
        return ResponseEntity.ok(Map.of(
                "application", applicationName,
                "description", "EHR/EMR demo backend for governance research"
        ));
    }
}
