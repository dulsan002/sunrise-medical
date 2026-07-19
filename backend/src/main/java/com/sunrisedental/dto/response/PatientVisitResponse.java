package com.sunrisedental.dto.response;

import com.sunrisedental.entity.enums.TreatmentStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class PatientVisitResponse {
    private Long visitId;
    private String visitNumber;
    private String appointmentNumber;
    private String patientName;
    private String dentistName;
    private LocalDate visitDate;
    private String diagnosis;
    private String prescription;
    private String dentistNotes;
    private TreatmentStatus treatmentStatus;
    private LocalDate followUpDate;
}
