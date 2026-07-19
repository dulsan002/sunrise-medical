package com.sunrisedental.controller;

import com.sunrisedental.dto.request.PatientVisitRequest;
import com.sunrisedental.dto.response.PatientVisitResponse;
import com.sunrisedental.service.PatientVisitService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/visits")
@RequiredArgsConstructor
public class PatientVisitController {

    private final PatientVisitService patientVisitService;

    @GetMapping
    @PreAuthorize("@securityService.hasPermission('VISITS', 'READ')")
    public ResponseEntity<List<PatientVisitResponse>> getAllVisits() {
        return ResponseEntity.ok(patientVisitService.getAllVisits());
    }

    @GetMapping("/{id}")
    @PreAuthorize("@securityService.hasPermission('VISITS', 'READ')")
    public ResponseEntity<PatientVisitResponse> getVisitById(@PathVariable Long id) {
        return ResponseEntity.ok(patientVisitService.getVisitById(id));
    }

    @PostMapping
    @PreAuthorize("@securityService.hasPermission('VISITS', 'CREATE')")
    public ResponseEntity<PatientVisitResponse> createVisit(@Valid @RequestBody PatientVisitRequest request) {
        return new ResponseEntity<>(patientVisitService.createVisit(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("@securityService.hasPermission('VISITS', 'UPDATE')")
    public ResponseEntity<PatientVisitResponse> updateVisit(@PathVariable Long id, @Valid @RequestBody PatientVisitRequest request) {
        return ResponseEntity.ok(patientVisitService.updateVisit(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@securityService.hasPermission('VISITS', 'DELETE')")
    public ResponseEntity<Void> deleteVisit(@PathVariable Long id) {
        patientVisitService.deleteVisit(id);
        return ResponseEntity.noContent().build();
    }
}

