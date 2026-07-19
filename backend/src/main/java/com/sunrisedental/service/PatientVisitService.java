package com.sunrisedental.service;

import com.sunrisedental.dto.request.PatientVisitRequest;
import com.sunrisedental.dto.response.PatientVisitResponse;
import com.sunrisedental.entity.Appointment;
import com.sunrisedental.entity.PatientVisit;
import com.sunrisedental.entity.enums.AppointmentStatus;
import com.sunrisedental.repository.AppointmentRepository;
import com.sunrisedental.repository.PatientVisitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PatientVisitService {

    private final PatientVisitRepository patientVisitRepository;
    private final AppointmentRepository appointmentRepository;
    private final AuditLogService auditLogService;

    private String getCurrentUsername() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        return (auth != null) ? auth.getName() : "SYSTEM";
    }

    public List<PatientVisitResponse> getAllVisits() {
        return patientVisitRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public PatientVisitResponse getVisitById(Long id) {
        PatientVisit visit = patientVisitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Visit record not found"));
        return mapToResponse(visit);
    }

    @Transactional
    public PatientVisitResponse createVisit(PatientVisitRequest request) {
        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        // Generate visit number
        String visitNumber = "VIS-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        PatientVisit visit = PatientVisit.builder()
                .visitNumber(visitNumber)
                .appointment(appointment)
                .patient(appointment.getPatient())
                .dentist(appointment.getDentist())
                .visitDate(LocalDate.now())
                .diagnosis(request.getDiagnosis())
                .prescription(request.getPrescription())
                .dentistNotes(request.getDentistNotes())
                .treatmentStatus(request.getTreatmentStatus())
                .followUpDate(request.getFollowUpDate())
                .build();

        // Mark appointment status as COMPLETED
        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointmentRepository.save(appointment);

        PatientVisit saved = patientVisitRepository.save(visit);

        // Audit Log entry
        auditLogService.log(getCurrentUsername(), com.sunrisedental.entity.enums.AuditAction.CREATE, "PatientVisit", saved.getVisitId(), null, String.format("{\"code\":\"%s\"}", saved.getVisitNumber()), null);

        return mapToResponse(saved);
    }

    @Transactional
    public PatientVisitResponse updateVisit(Long id, PatientVisitRequest request) {
        PatientVisit visit = patientVisitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Visit record not found"));

        String oldNum = visit.getVisitNumber();
        visit.setDiagnosis(request.getDiagnosis());
        visit.setPrescription(request.getPrescription());
        visit.setDentistNotes(request.getDentistNotes());
        visit.setTreatmentStatus(request.getTreatmentStatus());
        visit.setFollowUpDate(request.getFollowUpDate());

        PatientVisit saved = patientVisitRepository.save(visit);

        // Audit Log entry
        auditLogService.log(getCurrentUsername(), com.sunrisedental.entity.enums.AuditAction.UPDATE, "PatientVisit", saved.getVisitId(), String.format("{\"code\":\"%s\"}", oldNum), String.format("{\"code\":\"%s\"}", saved.getVisitNumber()), null);

        return mapToResponse(saved);
    }

    @Transactional
    public void deleteVisit(Long id) {
        PatientVisit visit = patientVisitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Visit record not found"));
        patientVisitRepository.delete(visit);

        // Audit Log entry
        auditLogService.log(getCurrentUsername(), com.sunrisedental.entity.enums.AuditAction.DELETE, "PatientVisit", id, String.format("{\"code\":\"%s\"}", visit.getVisitNumber()), null, null);
    }

    private PatientVisitResponse mapToResponse(PatientVisit visit) {
        return PatientVisitResponse.builder()
                .visitId(visit.getVisitId())
                .visitNumber(visit.getVisitNumber())
                .appointmentNumber(visit.getAppointment() != null ? visit.getAppointment().getAppointmentNumber() : null)
                .patientName(visit.getPatient().getFullName())
                .dentistName(visit.getDentist().getFullName())
                .visitDate(visit.getVisitDate())
                .diagnosis(visit.getDiagnosis())
                .prescription(visit.getPrescription())
                .dentistNotes(visit.getDentistNotes())
                .treatmentStatus(visit.getTreatmentStatus())
                .followUpDate(visit.getFollowUpDate())
                .build();
    }
}
