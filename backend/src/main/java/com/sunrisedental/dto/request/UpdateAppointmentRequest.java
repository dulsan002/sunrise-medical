package com.sunrisedental.dto.request;

import com.sunrisedental.entity.enums.AppointmentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class UpdateAppointmentRequest {

    @NotNull(message = "Dentist ID is required")
    private Long dentistId;

    @NotNull(message = "Treatment ID is required")
    private Long treatmentId;

    @NotNull(message = "Appointment date is required")
    private LocalDate appointmentDate;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "Status is required")
    private AppointmentStatus status;

    private String notes;
}
