package com.sunrisedental.dto.request;

import com.sunrisedental.entity.enums.TreatmentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class PatientVisitRequest {

    @NotNull(message = "Appointment ID is required")
    private Long appointmentId;

    private String diagnosis;
    private String prescription;
    private String dentistNotes;

    @NotNull(message = "Treatment status is required")
    private TreatmentStatus treatmentStatus = TreatmentStatus.COMPLETED;

    private LocalDate followUpDate;
}
