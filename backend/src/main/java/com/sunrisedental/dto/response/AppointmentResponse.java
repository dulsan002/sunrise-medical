package com.sunrisedental.dto.response;

import com.sunrisedental.entity.enums.AppointmentStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
public class AppointmentResponse {
    private Long appointmentId;
    private String appointmentNumber;
    
    // Patient details
    private Long patientId;
    private String patientName;
    private String patientAddress;
    private String patientContact;
    
    // Dentist details
    private Long dentistId;
    private String dentistName;
    private String dentistSpecialization;
    
    // Treatment details
    private Long treatmentId;
    private String treatmentName;
    
    private LocalDate appointmentDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private AppointmentStatus status;
    private String notes;
}
