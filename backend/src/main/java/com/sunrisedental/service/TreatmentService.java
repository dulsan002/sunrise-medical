package com.sunrisedental.service;

import com.sunrisedental.dto.request.TreatmentRequest;
import com.sunrisedental.dto.response.TreatmentResponse;
import com.sunrisedental.entity.Treatment;
import com.sunrisedental.repository.TreatmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TreatmentService {

    private final TreatmentRepository treatmentRepository;
    private final AuditLogService auditLogService;

    private String getCurrentUsername() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        return (auth != null) ? auth.getName() : "SYSTEM";
    }

    public List<TreatmentResponse> getAllTreatments() {
        return treatmentRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public TreatmentResponse getTreatmentById(Long id) {
        Treatment treatment = treatmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Treatment not found"));
        return mapToResponse(treatment);
    }

    @Transactional
    public TreatmentResponse createTreatment(TreatmentRequest request) {
        String treatmentCode = "TRT-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        Treatment treatment = Treatment.builder()
                .treatmentCode(treatmentCode)
                .treatmentName(request.getTreatmentName())
                .treatmentType(request.getTreatmentType())
                .description(request.getDescription())
                .estimatedDurationMinutes(request.getEstimatedDurationMinutes())
                .standardCharge(request.getStandardCharge())
                .status(request.getStatus())
                .build();

        Treatment saved = treatmentRepository.save(treatment);

        // Audit Log entry
        auditLogService.log(getCurrentUsername(), com.sunrisedental.entity.enums.AuditAction.CREATE, "Treatment", saved.getTreatmentId(), null, String.format("{\"code\":\"%s\"}", saved.getTreatmentCode()), null);

        return mapToResponse(saved);
    }

    @Transactional
    public TreatmentResponse updateTreatment(Long id, TreatmentRequest request) {
        Treatment treatment = treatmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Treatment not found"));

        String oldCode = treatment.getTreatmentCode();
        treatment.setTreatmentName(request.getTreatmentName());
        treatment.setTreatmentType(request.getTreatmentType());
        treatment.setDescription(request.getDescription());
        treatment.setEstimatedDurationMinutes(request.getEstimatedDurationMinutes());
        treatment.setStandardCharge(request.getStandardCharge());
        treatment.setStatus(request.getStatus());

        Treatment saved = treatmentRepository.save(treatment);

        // Audit Log entry
        auditLogService.log(getCurrentUsername(), com.sunrisedental.entity.enums.AuditAction.UPDATE, "Treatment", saved.getTreatmentId(), String.format("{\"code\":\"%s\"}", oldCode), String.format("{\"code\":\"%s\"}", saved.getTreatmentCode()), null);

        return mapToResponse(saved);
    }

    @Transactional
    public void deleteTreatment(Long id) {
        Treatment treatment = treatmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Treatment not found"));
        treatmentRepository.delete(treatment);

        // Audit Log entry
        auditLogService.log(getCurrentUsername(), com.sunrisedental.entity.enums.AuditAction.DELETE, "Treatment", id, String.format("{\"code\":\"%s\"}", treatment.getTreatmentCode()), null, null);
    }

    private TreatmentResponse mapToResponse(Treatment treatment) {
        return TreatmentResponse.builder()
                .treatmentId(treatment.getTreatmentId())
                .treatmentCode(treatment.getTreatmentCode())
                .treatmentName(treatment.getTreatmentName())
                .treatmentType(treatment.getTreatmentType())
                .description(treatment.getDescription())
                .estimatedDurationMinutes(treatment.getEstimatedDurationMinutes())
                .standardCharge(treatment.getStandardCharge())
                .status(treatment.getStatus())
                .build();
    }
}
