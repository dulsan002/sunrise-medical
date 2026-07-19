package com.sunrisedental.service;

import com.sunrisedental.dto.request.GenerateBillRequest;
import com.sunrisedental.dto.response.BillResponse;
import com.sunrisedental.entity.Appointment;
import com.sunrisedental.entity.Bill;
import com.sunrisedental.entity.enums.AppointmentStatus;
import com.sunrisedental.repository.AppointmentRepository;
import com.sunrisedental.repository.BillRepository;
import com.sunrisedental.repository.ClinicSettingRepository;
import com.sunrisedental.entity.ClinicSetting;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BillService {

    private final BillRepository billRepository;
    private final AppointmentRepository appointmentRepository;
    private final ClinicSettingRepository clinicSettingRepository;
    private final AuditLogService auditLogService;

    private String getCurrentUsername() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        return (auth != null) ? auth.getName() : "SYSTEM";
    }

    public List<BillResponse> getAllBills() {
        return billRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public BillResponse getBillByNumber(String billNumber) {
        Bill bill = billRepository.findByBillNumber(billNumber)
                .orElseThrow(() -> new RuntimeException("Bill not found"));
        return mapToResponse(bill);
    }

    public BillResponse previewBill(Long appointmentId) {
        GenerateBillRequest req = new GenerateBillRequest();
        req.setAppointmentId(appointmentId);
        req.setRemarks("PREVIEW ONLY");
        Bill bill = createBillObject(req);
        // Set a dummy bill number for preview
        bill.setBillNumber("PREVIEW");
        return mapToResponse(bill);
    }

    private Bill createBillObject(GenerateBillRequest request) {
        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (appointment.getStatus() != AppointmentStatus.COMPLETED && appointment.getStatus() != AppointmentStatus.SCHEDULED) {
            throw new RuntimeException("Cannot generate bill for this appointment status.");
        }

        // Fetch settings from database with fallbacks for global consultation fee
        BigDecimal globalConsultationFee = new BigDecimal(clinicSettingRepository.findBySettingKey("billing_consultation_fee")
                .map(ClinicSetting::getSettingValue).orElse("2000.00"));
        
        // Use dentist's specific consultation fee if set and greater than 0, else use global fallback
        BigDecimal dentistFee = appointment.getDentist().getConsultationFee();
        BigDecimal consultationFee = (dentistFee != null && dentistFee.compareTo(BigDecimal.ZERO) > 0) 
                ? dentistFee 
                : globalConsultationFee;
        BigDecimal treatmentTotal = appointment.getTreatment().getStandardCharge();
        BigDecimal subTotal = consultationFee.add(treatmentTotal);

        BigDecimal threshold = new BigDecimal(clinicSettingRepository.findBySettingKey("billing_discount_threshold")
                .map(ClinicSetting::getSettingValue).orElse("5000.00"));
        BigDecimal configuredDiscountPct = new BigDecimal(clinicSettingRepository.findBySettingKey("billing_discount_percentage")
                .map(ClinicSetting::getSettingValue).orElse("5.00"));

        BigDecimal discountPct = BigDecimal.ZERO;
        if (subTotal.compareTo(threshold) > 0) {
            discountPct = configuredDiscountPct;
        }

        BigDecimal taxPct = new BigDecimal(clinicSettingRepository.findBySettingKey("billing_tax_percentage")
                .map(ClinicSetting::getSettingValue).orElse("10.00"));

        BigDecimal discountAmount = subTotal.multiply(discountPct).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        BigDecimal afterDiscount = subTotal.subtract(discountAmount);
        BigDecimal taxAmount = afterDiscount.multiply(taxPct).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        BigDecimal finalTotal = afterDiscount.add(taxAmount);

        String billNumber = "INV-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        Bill bill = Bill.builder()
                .billNumber(billNumber)
                .appointment(appointment)
                .patient(appointment.getPatient())
                .consultationFee(consultationFee)
                .treatmentTotal(treatmentTotal)
                .subTotal(subTotal)
                .discountPercentage(discountPct)
                .discountAmount(discountAmount)
                .taxPercentage(taxPct)
                .taxAmount(taxAmount)
                .finalTotal(finalTotal)
                .remarks(request.getRemarks())
                .paymentStatus("PENDING")
                .build();

        return bill;
    }

    @Transactional
    public BillResponse generateBill(GenerateBillRequest request) {
        Bill bill = createBillObject(request);
        bill = billRepository.save(bill);
        
        // Mark appointment as COMPLETED if it's being billed
        Appointment appointment = bill.getAppointment();
        appointmentRepository.save(appointment);

        // Audit Log entry
        auditLogService.log(getCurrentUsername(), com.sunrisedental.entity.enums.AuditAction.CREATE, "Bill", bill.getBillId(), null, String.format("{\"code\":\"%s\"}", bill.getBillNumber()), null);

        return mapToResponse(bill);
    }

    @Transactional
    public BillResponse markAsPaid(String billNumber, String paymentMethod) {
        Bill bill = billRepository.findByBillNumber(billNumber)
                .orElseThrow(() -> new RuntimeException("Bill not found"));
        
        bill.setPaymentStatus("PAID");
        bill.setPaymentMethod(paymentMethod);
        bill.setPaymentDate(java.time.LocalDateTime.now());
        
        Bill saved = billRepository.save(bill);

        // Audit Log entry
        auditLogService.log(getCurrentUsername(), com.sunrisedental.entity.enums.AuditAction.UPDATE, "Bill", saved.getBillId(), "{\"status\":\"PENDING\"}", "{\"status\":\"PAID\"}", null);

        return mapToResponse(saved);
    }

    @Transactional
    public void deleteBill(Long id) {
        Bill bill = billRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bill not found"));
        billRepository.delete(bill);

        // Audit Log entry
        auditLogService.log(getCurrentUsername(), com.sunrisedental.entity.enums.AuditAction.DELETE, "Bill", id, String.format("{\"code\":\"%s\"}", bill.getBillNumber()), null, null);
    }

    private BillResponse mapToResponse(Bill bill) {
        return BillResponse.builder()
                .billId(bill.getBillId())
                .billNumber(bill.getBillNumber())
                .appointmentNumber(bill.getAppointment() != null ? bill.getAppointment().getAppointmentNumber() : null)
                .patientName(bill.getPatient().getFullName())
                .patientContact(bill.getPatient().getTelephone())
                .dentistName(bill.getAppointment() != null ? bill.getAppointment().getDentist().getFullName() : null)
                .treatmentName(bill.getAppointment() != null ? bill.getAppointment().getTreatment().getTreatmentName() : null)
                .consultationFee(bill.getConsultationFee())
                .treatmentTotal(bill.getTreatmentTotal())
                .subTotal(bill.getSubTotal())
                .discountAmount(bill.getDiscountAmount())
                .taxAmount(bill.getTaxAmount())
                .finalTotal(bill.getFinalTotal())
                .paymentStatus(bill.getPaymentStatus())
                .paymentMethod(bill.getPaymentMethod())
                .paymentDate(bill.getPaymentDate())
                .remarks(bill.getRemarks())
                .build();
    }
}
