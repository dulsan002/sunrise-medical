package com.sunrisedental.controller;

import com.sunrisedental.dto.request.TreatmentRequest;
import com.sunrisedental.dto.response.TreatmentResponse;
import com.sunrisedental.service.TreatmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/treatments")
@RequiredArgsConstructor
public class TreatmentController {

    private final TreatmentService treatmentService;

    @GetMapping
    @PreAuthorize("@securityService.hasPermission('TREATMENTS', 'READ')")
    public ResponseEntity<List<TreatmentResponse>> getAllTreatments() {
        return ResponseEntity.ok(treatmentService.getAllTreatments());
    }

    @GetMapping("/{id}")
    @PreAuthorize("@securityService.hasPermission('TREATMENTS', 'READ')")
    public ResponseEntity<TreatmentResponse> getTreatmentById(@PathVariable Long id) {
        return ResponseEntity.ok(treatmentService.getTreatmentById(id));
    }

    @PostMapping
    @PreAuthorize("@securityService.hasPermission('TREATMENTS', 'CREATE')")
    public ResponseEntity<TreatmentResponse> createTreatment(@Valid @RequestBody TreatmentRequest request) {
        return new ResponseEntity<>(treatmentService.createTreatment(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("@securityService.hasPermission('TREATMENTS', 'UPDATE')")
    public ResponseEntity<TreatmentResponse> updateTreatment(@PathVariable Long id, @Valid @RequestBody TreatmentRequest request) {
        return ResponseEntity.ok(treatmentService.updateTreatment(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@securityService.hasPermission('TREATMENTS', 'DELETE')")
    public ResponseEntity<Void> deleteTreatment(@PathVariable Long id) {
        treatmentService.deleteTreatment(id);
        return ResponseEntity.noContent().build();
    }
}

