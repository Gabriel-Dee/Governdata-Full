package com.governdata.governdata.api.controller;

import com.governdata.governdata.api.dto.MetricsResponseDTO;
import com.governdata.governdata.service.MetricsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class MetricsController {

    private final MetricsService metricsService;

    @GetMapping(value = "/metrics", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<MetricsResponseDTO> getMetrics() {
        return ResponseEntity.ok(metricsService.getMetrics());
    }
}
