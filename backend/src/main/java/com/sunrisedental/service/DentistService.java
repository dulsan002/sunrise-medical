package com.sunrisedental.service;

import com.sunrisedental.dto.request.DentistRequest;
import com.sunrisedental.dto.response.DentistResponse;
import com.sunrisedental.entity.Dentist;
import com.sunrisedental.repository.DentistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DentistService {

    private final DentistRepository dentistRepository;
    private final AuditLogService auditLogService;

    private String getCurrentUsername() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        return (auth != null) ? auth.getName() : "SYSTEM";
    }

    public List<DentistResponse> getAllDentists() {
        return dentistRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public DentistResponse getDentistById(Long id) {
        Dentist dentist = dentistRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dentist not found"));
        return mapToResponse(dentist);
    }

    @Transactional
    public DentistResponse createDentist(DentistRequest request) {
        String dentistCode = "DEN-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        Dentist dentist = Dentist.builder()
                .dentistCode(dentistCode)
                .fullName(request.getFullName())
                .specialization(request.getSpecialization())
                .qualifications(request.getQualifications())
                .licenseNumber(request.getLicenseNumber())
                .telephone(request.getTelephone())
                .email(request.getEmail())
                .joinedDate(request.getJoinedDate())
                .status(request.getStatus())
                .consultationFee(request.getConsultationFee())
                .build();

        Dentist saved = dentistRepository.save(dentist);

        // Audit Log entry
        auditLogService.log(getCurrentUsername(), com.sunrisedental.entity.enums.AuditAction.CREATE, "Dentist", saved.getDentistId(), null, String.format("{\"code\":\"%s\"}", saved.getDentistCode()), null);

        return mapToResponse(saved);
    }

    @Transactional
    public DentistResponse updateDentist(Long id, DentistRequest request) {
        Dentist dentist = dentistRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dentist not found"));

        String oldCode = dentist.getDentistCode();
        dentist.setFullName(request.getFullName());
        dentist.setSpecialization(request.getSpecialization());
        dentist.setQualifications(request.getQualifications());
        dentist.setLicenseNumber(request.getLicenseNumber());
        dentist.setTelephone(request.getTelephone());
        dentist.setEmail(request.getEmail());
        dentist.setJoinedDate(request.getJoinedDate());
        dentist.setStatus(request.getStatus());
        dentist.setConsultationFee(request.getConsultationFee());

        Dentist saved = dentistRepository.save(dentist);

        // Audit Log entry
        auditLogService.log(getCurrentUsername(), com.sunrisedental.entity.enums.AuditAction.UPDATE, "Dentist", saved.getDentistId(), String.format("{\"code\":\"%s\"}", oldCode), String.format("{\"code\":\"%s\"}", saved.getDentistCode()), null);

        return mapToResponse(saved);
    }

    @Transactional
    public void deleteDentist(Long id) {
        Dentist dentist = dentistRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dentist not found"));
        dentistRepository.delete(dentist);

        // Audit Log entry
        auditLogService.log(getCurrentUsername(), com.sunrisedental.entity.enums.AuditAction.DELETE, "Dentist", id, String.format("{\"code\":\"%s\"}", dentist.getDentistCode()), null, null);
    }

    private DentistResponse mapToResponse(Dentist dentist) {
        return DentistResponse.builder()
                .dentistId(dentist.getDentistId())
                .dentistCode(dentist.getDentistCode())
                .fullName(dentist.getFullName())
                .specialization(dentist.getSpecialization())
                .qualifications(dentist.getQualifications())
                .licenseNumber(dentist.getLicenseNumber())
                .telephone(dentist.getTelephone())
                .email(dentist.getEmail())
                .joinedDate(dentist.getJoinedDate())
                .status(dentist.getStatus())
                .consultationFee(dentist.getConsultationFee())
                .build();
    }
}
