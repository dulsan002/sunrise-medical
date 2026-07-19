package com.sunrisedental.repository;

import com.sunrisedental.entity.PatientVisit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PatientVisitRepository extends JpaRepository<PatientVisit, Long> {
    Optional<PatientVisit> findByVisitNumber(String visitNumber);
}
