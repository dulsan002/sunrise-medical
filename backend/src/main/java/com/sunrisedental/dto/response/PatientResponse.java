package com.sunrisedental.dto.response;

import com.sunrisedental.entity.enums.Gender;
import com.sunrisedental.entity.enums.PatientStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class PatientResponse {
    private Long patientId;
    private String patientCode;
    private String fullName;
    private String nic;
    private Gender gender;
    private LocalDate dateOfBirth;
    private String address;
    private String telephone;
    private String email;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String medicalNotes;
    private String bloodGroup;
    private LocalDate registrationDate;
    private PatientStatus status;
}
