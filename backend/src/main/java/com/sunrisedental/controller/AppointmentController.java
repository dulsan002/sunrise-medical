package com.sunrisedental.controller;

import com.sunrisedental.dto.request.CreateAppointmentRequest;
import com.sunrisedental.dto.request.UpdateAppointmentRequest;
import com.sunrisedental.dto.response.AppointmentResponse;
import com.sunrisedental.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @GetMapping
    @PreAuthorize("@securityService.hasPermission('APPOINTMENTS', 'READ')")
    public ResponseEntity<List<AppointmentResponse>> getAllAppointments() {
        return ResponseEntity.ok(appointmentService.getAllAppointments());
    }

    @GetMapping("/id/{id}")
    @PreAuthorize("@securityService.hasPermission('APPOINTMENTS', 'READ')")
    public ResponseEntity<AppointmentResponse> getAppointmentById(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.getAppointmentById(id));
    }

    @GetMapping("/{appointmentNumber}")
    @PreAuthorize("@securityService.hasPermission('APPOINTMENTS', 'READ')")
    public ResponseEntity<AppointmentResponse> getAppointmentByNumber(@PathVariable String appointmentNumber) {
        return ResponseEntity.ok(appointmentService.getAppointmentByNumber(appointmentNumber));
    }

    @PostMapping
    @PreAuthorize("@securityService.hasPermission('APPOINTMENTS', 'CREATE')")
    public ResponseEntity<AppointmentResponse> createAppointment(@Valid @RequestBody CreateAppointmentRequest request) {
        return new ResponseEntity<>(appointmentService.createAppointment(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("@securityService.hasPermission('APPOINTMENTS', 'UPDATE')")
    public ResponseEntity<AppointmentResponse> updateAppointment(@PathVariable Long id, @Valid @RequestBody UpdateAppointmentRequest request) {
        return ResponseEntity.ok(appointmentService.updateAppointment(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@securityService.hasPermission('APPOINTMENTS', 'DELETE')")
    public ResponseEntity<Void> deleteAppointment(@PathVariable Long id) {
        appointmentService.deleteAppointment(id);
        return ResponseEntity.noContent().build();
    }
}

