package com.sunrisedental.controller;

import com.sunrisedental.dto.request.GenerateBillRequest;
import com.sunrisedental.dto.response.BillResponse;
import com.sunrisedental.service.BillService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bills")
@RequiredArgsConstructor
public class BillController {

    private final BillService billService;

    @GetMapping
    @PreAuthorize("@securityService.hasPermission('BILLING', 'READ')")
    public ResponseEntity<List<BillResponse>> getAllBills() {
        return ResponseEntity.ok(billService.getAllBills());
    }

    @GetMapping("/{billNumber}")
    @PreAuthorize("@securityService.hasPermission('BILLING', 'READ')")
    public ResponseEntity<BillResponse> getBillByNumber(@PathVariable String billNumber) {
        return ResponseEntity.ok(billService.getBillByNumber(billNumber));
    }

    @GetMapping("/preview/{appointmentId}")
    @PreAuthorize("@securityService.hasPermission('BILLING', 'READ')")
    public ResponseEntity<BillResponse> previewBill(@PathVariable Long appointmentId) {
        return ResponseEntity.ok(billService.previewBill(appointmentId));
    }

    @PostMapping
    @PreAuthorize("@securityService.hasPermission('BILLING', 'CREATE')")
    public ResponseEntity<BillResponse> generateBill(@Valid @RequestBody GenerateBillRequest request) {
        return new ResponseEntity<>(billService.generateBill(request), HttpStatus.CREATED);
    }

    @PutMapping("/{billNumber}/pay")
    @PreAuthorize("@securityService.hasPermission('BILLING', 'UPDATE')")
    public ResponseEntity<BillResponse> markAsPaid(
            @PathVariable String billNumber,
            @RequestParam String paymentMethod) {
        return ResponseEntity.ok(billService.markAsPaid(billNumber, paymentMethod));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@securityService.hasPermission('BILLING', 'DELETE')")
    public ResponseEntity<Void> deleteBill(@PathVariable Long id) {
        billService.deleteBill(id);
        return ResponseEntity.noContent().build();
    }
}

