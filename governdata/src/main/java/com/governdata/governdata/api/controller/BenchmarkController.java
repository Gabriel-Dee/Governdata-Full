package com.governdata.governdata.api.controller;

import com.governdata.governdata.api.dto.benchmark.BenchmarkRequest;
import com.governdata.governdata.api.dto.benchmark.BenchmarkResponse;
import com.governdata.governdata.service.benchmark.BenchmarkHarnessService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/benchmark")
@RequiredArgsConstructor
public class BenchmarkController {

    private final BenchmarkHarnessService benchmarkHarnessService;

    @PostMapping(value = "/policy-runtime", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<BenchmarkResponse> run(@Valid @RequestBody BenchmarkRequest request) {
        return ResponseEntity.ok(benchmarkHarnessService.run(request));
    }
}
