package com.sunrisedental.controller;

import com.sunrisedental.entity.ClinicSetting;
import com.sunrisedental.service.ClinicSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/settings/clinic")
@RequiredArgsConstructor
public class ClinicSettingController {

    private final ClinicSettingService clinicSettingService;

    @GetMapping
    public ResponseEntity<List<ClinicSetting>> getAllSettings() {
        return ResponseEntity.ok(clinicSettingService.getAllSettings());
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ClinicSetting> updateSetting(
            @RequestParam String key,
            @RequestParam String value) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(clinicSettingService.updateSetting(key, value, username));
    }
}
