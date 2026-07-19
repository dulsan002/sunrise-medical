package com.sunrisedental.dto.request;

import com.sunrisedental.entity.enums.Gender;
import com.sunrisedental.entity.enums.PatientStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.time.LocalDate;

@Data
public class PatientRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "NIC is required")
    @Pattern(regexp = "^([0-9]{9}[vVxX]|[0-9]{12})$", message = "Invalid NIC format")
    private String nic;

    @NotNull(message = "Gender is required")
    private Gender gender;

    @NotNull(message = "Date of birth is required")
    private LocalDate dateOfBirth;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "Telephone is required")
    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Invalid telephone number")
    private String telephone;

    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Emergency contact name is required")
    private String emergencyContactName;

    @NotBlank(message = "Emergency contact phone is required")
    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Invalid emergency contact phone")
    private String emergencyContactPhone;

    private String medicalNotes;

    private String bloodGroup;

    private PatientStatus status = PatientStatus.ACTIVE;
}
