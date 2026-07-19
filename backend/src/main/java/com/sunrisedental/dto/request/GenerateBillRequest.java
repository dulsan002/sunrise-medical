package com.sunrisedental.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class GenerateBillRequest {

    @NotNull(message = "Appointment ID is required")
    private Long appointmentId;

    private BigDecimal discountPercentage = BigDecimal.ZERO;
    private BigDecimal taxPercentage = BigDecimal.ZERO;
    private String remarks;
}
