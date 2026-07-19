package com.sunrisedental.controller;

import com.sunrisedental.dto.request.DentistRequest;
import com.sunrisedental.dto.response.DentistResponse;
import com.sunrisedental.service.DentistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/dentists")
@RequiredArgsConstructor
public class DentistController {

    private final DentistService dentistService;

    @GetMapping
    @PreAuthorize("@securityService.hasPermission('DENTISTS', 'READ')")
    public ResponseEntity<List<DentistResponse>> getAllDentists() {
        return ResponseEntity.ok(dentistService.getAllDentists());
    }

    @GetMapping("/{id}")
    @PreAuthorize("@securityService.hasPermission('DENTISTS', 'READ')")
    public ResponseEntity<DentistResponse> getDentistById(@PathVariable Long id) {
        return ResponseEntity.ok(dentistService.getDentistById(id));
    }

    @PostMapping
    @PreAuthorize("@securityService.hasPermission('DENTISTS', 'CREATE')")
    public ResponseEntity<DentistResponse> createDentist(@Valid @RequestBody DentistRequest request) {
        return new ResponseEntity<>(dentistService.createDentist(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("@securityService.hasPermission('DENTISTS', 'UPDATE')")
    public ResponseEntity<DentistResponse> updateDentist(@PathVariable Long id, @Valid @RequestBody DentistRequest request) {
        return ResponseEntity.ok(dentistService.updateDentist(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@securityService.hasPermission('DENTISTS', 'DELETE')")
    public ResponseEntity<Void> deleteDentist(@PathVariable Long id) {
        dentistService.deleteDentist(id);
        return ResponseEntity.noContent().build();
    }
}

