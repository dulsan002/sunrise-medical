package com.sunrisedental.service;

import com.sunrisedental.dto.request.PatientRequest;
import com.sunrisedental.dto.response.PatientResponse;
import com.sunrisedental.entity.Patient;
import com.sunrisedental.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    private String getCurrentUsername() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        return (auth != null) ? auth.getName() : "SYSTEM";
    }

    public List<PatientResponse> getAllPatients() {
        return patientRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public PatientResponse getPatientById(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        return mapToResponse(patient);
    }

    @Transactional
    public PatientResponse createPatient(PatientRequest request) {
        if (patientRepository.existsByNic(request.getNic())) {
            throw new RuntimeException("Patient with this NIC already exists");
        }

        String patientCode = "PAT-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        Patient patient = Patient.builder()
                .patientCode(patientCode)
                .fullName(request.getFullName())
                .nic(request.getNic())
                .gender(request.getGender())
                .dateOfBirth(request.getDateOfBirth())
                .address(request.getAddress())
                .telephone(request.getTelephone())
                .email(request.getEmail())
                .emergencyContactName(request.getEmergencyContactName())
                .emergencyContactPhone(request.getEmergencyContactPhone())
                .medicalNotes(request.getMedicalNotes())
                .bloodGroup(request.getBloodGroup())
                .status(request.getStatus())
                .build();

        Patient saved = patientRepository.save(patient);

        // Audit Log entry
        auditLogService.log(getCurrentUsername(), com.sunrisedental.entity.enums.AuditAction.CREATE, "Patient", saved.getPatientId(), null, String.format("{\"code\":\"%s\"}", saved.getPatientCode()), null);

        // Notify admin and receptionist
        try {
            notificationService.createNotificationForUsername("admin", "SYSTEM", "New Patient Registered", "Patient " + saved.getFullName() + " (" + saved.getPatientCode() + ") has been successfully registered.");
            notificationService.createNotificationForUsername("receptionist", "SYSTEM", "New Patient Registered", "Patient " + saved.getFullName() + " (" + saved.getPatientCode() + ") has been successfully registered.");
        } catch (Exception e) {
            // Log warning but don't fail transaction
        }

        return mapToResponse(saved);
    }

    @Transactional
    public PatientResponse updatePatient(Long id, PatientRequest request) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        if (!patient.getNic().equals(request.getNic()) && patientRepository.existsByNic(request.getNic())) {
            throw new RuntimeException("Patient with this NIC already exists");
        }

        String oldCode = patient.getPatientCode();
        patient.setFullName(request.getFullName());
        patient.setNic(request.getNic());
        patient.setGender(request.getGender());
        patient.setDateOfBirth(request.getDateOfBirth());
        patient.setAddress(request.getAddress());
        patient.setTelephone(request.getTelephone());
        patient.setEmail(request.getEmail());
        patient.setEmergencyContactName(request.getEmergencyContactName());
        patient.setEmergencyContactPhone(request.getEmergencyContactPhone());
        patient.setMedicalNotes(request.getMedicalNotes());
        patient.setBloodGroup(request.getBloodGroup());
        patient.setStatus(request.getStatus());

        Patient saved = patientRepository.save(patient);

        // Audit Log entry
        auditLogService.log(getCurrentUsername(), com.sunrisedental.entity.enums.AuditAction.UPDATE, "Patient", saved.getPatientId(), String.format("{\"code\":\"%s\"}", oldCode), String.format("{\"code\":\"%s\"}", saved.getPatientCode()), null);

        return mapToResponse(saved);
    }

    @Transactional
    public void deletePatient(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        patientRepository.delete(patient);

        // Audit Log entry
        auditLogService.log(getCurrentUsername(), com.sunrisedental.entity.enums.AuditAction.DELETE, "Patient", id, String.format("{\"code\":\"%s\"}", patient.getPatientCode()), null, null);
    }

    private PatientResponse mapToResponse(Patient patient) {
        return PatientResponse.builder()
                .patientId(patient.getPatientId())
                .patientCode(patient.getPatientCode())
                .fullName(patient.getFullName())
                .nic(patient.getNic())
                .gender(patient.getGender())
                .dateOfBirth(patient.getDateOfBirth())
                .address(patient.getAddress())
                .telephone(patient.getTelephone())
                .email(patient.getEmail())
                .emergencyContactName(patient.getEmergencyContactName())
                .emergencyContactPhone(patient.getEmergencyContactPhone())
                .medicalNotes(patient.getMedicalNotes())
                .bloodGroup(patient.getBloodGroup())
                .registrationDate(patient.getRegistrationDate())
                .status(patient.getStatus())
                .build();
    }
}
