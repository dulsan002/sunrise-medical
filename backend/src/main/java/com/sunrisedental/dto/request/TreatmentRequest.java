package com.sunrisedental.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class TreatmentRequest {

    @NotBlank(message = "Treatment name is required")
    private String treatmentName;

    @NotBlank(message = "Treatment type is required")
    private String treatmentType;

    private String description;

    @NotNull(message = "Estimated duration is required")
    @Positive(message = "Duration must be positive")
    private Integer estimatedDurationMinutes;

    @NotNull(message = "Standard charge is required")
    @Positive(message = "Charge must be positive")
    private BigDecimal standardCharge;

    @NotBlank(message = "Status is required")
    private String status = "ACTIVE";
}
