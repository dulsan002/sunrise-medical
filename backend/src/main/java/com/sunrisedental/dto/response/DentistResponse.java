package com.sunrisedental.dto.response;

import com.sunrisedental.entity.enums.DentistStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class DentistResponse {
    private Long dentistId;
    private String dentistCode;
    private String fullName;
    private String specialization;
    private String qualifications;
    private String licenseNumber;
    private String telephone;
    private String email;
    private LocalDate joinedDate;
    private DentistStatus status;
    private BigDecimal consultationFee;
}
