package com.sunrisedental.dto.request;

import com.sunrisedental.entity.enums.DentistStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class DentistRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Specialization is required")
    private String specialization;

    @NotBlank(message = "Qualifications are required")
    private String qualifications;

    @NotBlank(message = "License number is required")
    private String licenseNumber;

    @NotBlank(message = "Telephone is required")
    private String telephone;

    @Email(message = "Invalid email format")
    @NotBlank(message = "Email is required")
    private String email;

    @NotNull(message = "Joined date is required")
    private LocalDate joinedDate;

    @NotNull(message = "Status is required")
    private DentistStatus status = DentistStatus.ACTIVE;

    @NotNull(message = "Consultation fee is required")
    @Positive(message = "Consultation fee must be positive")
    private BigDecimal consultationFee;
}
