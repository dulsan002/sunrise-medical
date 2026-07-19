package com.sunrisedental.service;

import com.sunrisedental.dto.request.CreateAppointmentRequest;
import com.sunrisedental.dto.request.UpdateAppointmentRequest;
import com.sunrisedental.dto.response.AppointmentResponse;
import com.sunrisedental.entity.Appointment;
import com.sunrisedental.entity.Dentist;
import com.sunrisedental.entity.Patient;
import com.sunrisedental.entity.Treatment;
import com.sunrisedental.entity.enums.AppointmentStatus;
import com.sunrisedental.repository.AppointmentRepository;
import com.sunrisedental.repository.DentistRepository;
import com.sunrisedental.repository.PatientRepository;
import com.sunrisedental.repository.TreatmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DentistRepository dentistRepository;
    private final TreatmentRepository treatmentRepository;
    private final AuditLogService auditLogService;

    private String getCurrentUsername() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        return (auth != null) ? auth.getName() : "SYSTEM";
    }

    public List<AppointmentResponse> getAllAppointments() {
        return appointmentRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public AppointmentResponse getAppointmentById(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        return mapToResponse(appointment);
    }

    public AppointmentResponse getAppointmentByNumber(String appointmentNumber) {
        Appointment appointment = appointmentRepository.findByAppointmentNumber(appointmentNumber)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        return mapToResponse(appointment);
    }

    @Transactional
    public AppointmentResponse createAppointment(CreateAppointmentRequest request) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        
        Dentist dentist = dentistRepository.findById(request.getDentistId())
                .orElseThrow(() -> new RuntimeException("Dentist not found"));
                
        Treatment treatment = treatmentRepository.findById(request.getTreatmentId())
                .orElseThrow(() -> new RuntimeException("Treatment not found"));

        // Generate a unique short appointment number like APT-12345
        String appointmentNumber = "APT-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        Appointment appointment = Appointment.builder()
                .appointmentNumber(appointmentNumber)
                .patient(patient)
                .dentist(dentist)
                .treatment(treatment)
                .appointmentDate(request.getAppointmentDate())
                .startTime(request.getStartTime())
                .endTime(request.getStartTime().plusMinutes(treatment.getEstimatedDurationMinutes()))
                .status(AppointmentStatus.SCHEDULED)
                .build();

        appointment = appointmentRepository.save(appointment);

        // Audit Log entry
        auditLogService.log(getCurrentUsername(), com.sunrisedental.entity.enums.AuditAction.CREATE, "Appointment", appointment.getAppointmentId(), null, String.format("{\"code\":\"%s\"}", appointment.getAppointmentNumber()), null);

        return mapToResponse(appointment);
    }

    @Transactional
    public AppointmentResponse updateAppointment(Long id, UpdateAppointmentRequest request) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        Dentist dentist = dentistRepository.findById(request.getDentistId())
                .orElseThrow(() -> new RuntimeException("Dentist not found"));
                
        Treatment treatment = treatmentRepository.findById(request.getTreatmentId())
                .orElseThrow(() -> new RuntimeException("Treatment not found"));

        String oldNum = appointment.getAppointmentNumber();
        appointment.setDentist(dentist);
        appointment.setTreatment(treatment);
        appointment.setAppointmentDate(request.getAppointmentDate());
        appointment.setStartTime(request.getStartTime());
        appointment.setEndTime(request.getStartTime().plusMinutes(treatment.getEstimatedDurationMinutes()));
        appointment.setStatus(request.getStatus());
        appointment.setNotes(request.getNotes());

        Appointment saved = appointmentRepository.save(appointment);

        // Audit Log entry
        auditLogService.log(getCurrentUsername(), com.sunrisedental.entity.enums.AuditAction.UPDATE, "Appointment", saved.getAppointmentId(), String.format("{\"code\":\"%s\"}", oldNum), String.format("{\"code\":\"%s\"}", saved.getAppointmentNumber()), null);

        return mapToResponse(saved);
    }

    @Transactional
    public void deleteAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        appointmentRepository.delete(appointment);

        // Audit Log entry
        auditLogService.log(getCurrentUsername(), com.sunrisedental.entity.enums.AuditAction.DELETE, "Appointment", id, String.format("{\"code\":\"%s\"}", appointment.getAppointmentNumber()), null, null);
    }

    private AppointmentResponse mapToResponse(Appointment appointment) {
        return AppointmentResponse.builder()
                .appointmentId(appointment.getAppointmentId())
                .appointmentNumber(appointment.getAppointmentNumber())
                .patientId(appointment.getPatient().getPatientId())
                .patientName(appointment.getPatient().getFullName())
                .patientAddress(appointment.getPatient().getAddress())
                .patientContact(appointment.getPatient().getTelephone())
                .dentistId(appointment.getDentist().getDentistId())
                .dentistName(appointment.getDentist().getFullName())
                .dentistSpecialization(appointment.getDentist().getSpecialization())
                .treatmentId(appointment.getTreatment().getTreatmentId())
                .treatmentName(appointment.getTreatment().getTreatmentName())
                .appointmentDate(appointment.getAppointmentDate())
                .startTime(appointment.getStartTime())
                .endTime(appointment.getEndTime())
                .status(appointment.getStatus())
                .notes(appointment.getNotes())
                .build();
    }
}
