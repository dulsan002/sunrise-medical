package com.sunrisedental.repository;

import com.sunrisedental.entity.Dentist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DentistRepository extends JpaRepository<Dentist, Long> {
    Optional<Dentist> findByDentistCode(String dentistCode);
    Optional<Dentist> findByLicenseNumber(String licenseNumber);
    boolean existsByLicenseNumber(String licenseNumber);
}
