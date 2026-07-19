package com.sunrisedental.repository;

import com.sunrisedental.entity.Patient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByPatientCode(String patientCode);
    Optional<Patient> findByNic(String nic);
    boolean existsByNic(String nic);

    @Query("SELECT p FROM Patient p WHERE " +
           "LOWER(p.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.nic) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.telephone) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.patientCode) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Patient> searchPatients(@Param("query") String query, Pageable pageable);
}
