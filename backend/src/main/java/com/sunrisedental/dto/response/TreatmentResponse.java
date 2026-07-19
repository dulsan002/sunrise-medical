package com.sunrisedental.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class TreatmentResponse {
    private Long treatmentId;
    private String treatmentCode;
    private String treatmentName;
    private String treatmentType;
    private String description;
    private Integer estimatedDurationMinutes;
    private BigDecimal standardCharge;
    private String status;
}
