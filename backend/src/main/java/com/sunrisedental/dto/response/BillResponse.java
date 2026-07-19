package com.sunrisedental.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class BillResponse {
    private Long billId;
    private String billNumber;
    private String appointmentNumber;
    private String patientName;
    private String patientContact;
    private String dentistName;
    private String treatmentName;
    
    private BigDecimal consultationFee;
    private BigDecimal treatmentTotal;
    private BigDecimal subTotal;
    private BigDecimal discountAmount;
    private BigDecimal taxAmount;
    private BigDecimal finalTotal;
    
    private String paymentStatus;
    private String paymentMethod;
    private LocalDateTime paymentDate;
    private String remarks;
}
