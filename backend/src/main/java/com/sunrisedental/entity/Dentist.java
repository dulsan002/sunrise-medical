package com.sunrisedental.entity;

import com.sunrisedental.entity.enums.DentistStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "dentists")
@EntityListeners(AuditingEntityListener.class)
@SQLDelete(sql = "UPDATE dentists SET is_deleted = true WHERE dentist_id = ?")
@SQLRestriction("is_deleted = false")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Dentist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "dentist_id")
    private Long dentistId;

    @Column(name = "dentist_code", nullable = false, length = 20)
    private String dentistCode;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(nullable = false, length = 100)
    private String specialization;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String qualifications;

    @Column(name = "license_number", nullable = false, length = 50)
    private String licenseNumber;

    @Column(nullable = false, length = 15)
    private String telephone;

    @Column(nullable = false, length = 100)
    private String email;

    @Column(name = "joined_date", nullable = false)
    @Builder.Default
    private LocalDate joinedDate = LocalDate.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Builder.Default
    private DentistStatus status = DentistStatus.ACTIVE;

    @Column(name = "consultation_fee", nullable = false, precision = 12, scale = 2)
    private BigDecimal consultationFee;

    @Column(name = "is_deleted", nullable = false)
    @Builder.Default
    private boolean isDeleted = false;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @CreatedBy
    @Column(name = "created_by", length = 50, updatable = false)
    private String createdBy;

    @LastModifiedBy
    @Column(name = "updated_by", length = 50)
    private String updatedBy;
}
