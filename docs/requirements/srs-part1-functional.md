# Software Requirements Specification — Part 1: Functional Requirements

**Document ID:** SDC-SRS-001 | **Version:** 1.0 | **Date:** 14 July 2026  
**Project:** Sunrise Dental Clinic Management System (SDCMS)  
**Status:** Awaiting Approval

---

## 1. Introduction

### 1.1 Purpose
This SRS defines the complete functional and non-functional requirements for SDCMS. It serves as the binding contract between stakeholders and the development team.

### 1.2 Scope
SDCMS is a full-stack web application replacing all paper-based operations at Sunrise Dental Clinic, Colombo. It covers authentication, patient management, appointments, dentist management, treatments, visits, billing, search, reports, help, settings, and audit logging.

### 1.3 References
| Document | ID |
|---|---|
| Business Analysis | SDC-BA-001 |
| Vision Document | SDC-VIS-001 |
| Diagrams Part 1–3 | SDC-DIA-001 to 003 |

### 1.4 Conventions
- **FR-XX-NNN**: Functional Requirement (Module-Number)
- **NFR-XX-NNN**: Non-Functional Requirement
- **Priority**: MUST / SHOULD / COULD (MoSCoW)

---

## 2. Functional Requirements

### 2.1 Authentication & Authorization (AUTH)

| ID | Requirement | Priority | Business Rule |
|---|---|---|---|
| FR-AU-001 | System SHALL provide a login page with username and password fields | MUST | — |
| FR-AU-002 | System SHALL authenticate users against BCrypt-hashed passwords stored in the database | MUST | BR-S01 |
| FR-AU-003 | System SHALL issue a JWT token upon successful authentication with 8-hour expiry | MUST | BR-S02 |
| FR-AU-004 | System SHALL support three roles: RECEPTIONIST, DENTIST, ADMIN | MUST | — |
| FR-AU-005 | System SHALL restrict page and API access based on user role | MUST | — |
| FR-AU-006 | System SHALL lock accounts after 5 consecutive failed login attempts | MUST | BR-S03 |
| FR-AU-007 | System SHALL log all login attempts (success and failure) in audit log | MUST | BR-S03, BR-S05 |
| FR-AU-008 | System SHALL provide a "Change Password" feature requiring old password verification | MUST | BR-S06 |
| FR-AU-009 | System SHALL enforce password policy: min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special | MUST | BR-S06 |
| FR-AU-010 | System SHALL provide secure logout that invalidates the client-side token | MUST | — |
| FR-AU-011 | System SHALL redirect unauthenticated users to the login page | MUST | — |
| FR-AU-012 | System SHOULD provide a "Forgot Password" feature via admin reset | SHOULD | — |

### 2.2 Patient Registration (PAT)

| ID | Requirement | Priority | Business Rule |
|---|---|---|---|
| FR-PA-001 | System SHALL allow creation of a new patient record with fields: Full Name, NIC, Gender, Date of Birth, Address, Telephone, Email, Emergency Contact Name, Emergency Contact Phone, Medical Notes, Blood Group | MUST | — |
| FR-PA-002 | System SHALL auto-generate a unique Patient Code in format PAT-YYYY-NNNNN | MUST | — |
| FR-PA-003 | System SHALL enforce NIC uniqueness across all patients | MUST | BR-P01 |
| FR-PA-004 | System SHALL validate telephone in Sri Lankan format (+94XXXXXXXXX or 0XXXXXXXXX) | MUST | BR-P02 |
| FR-PA-005 | System SHALL validate email format if provided | MUST | BR-P03 |
| FR-PA-006 | System SHALL validate date of birth is in the past | MUST | BR-P04 |
| FR-PA-007 | System SHALL auto-set registration date to current date | MUST | — |
| FR-PA-008 | System SHALL set initial patient status to ACTIVE | MUST | BR-P05 |
| FR-PA-009 | System SHALL allow updating all patient fields except Patient Code | MUST | — |
| FR-PA-010 | System SHALL allow deactivating a patient (status → INACTIVE) | MUST | BR-P05 |
| FR-PA-011 | System SHALL prevent scheduling appointments for INACTIVE/DECEASED patients | MUST | BR-P06 |
| FR-PA-012 | System SHALL display patient list with search, sort, filter, and pagination | MUST | — |
| FR-PA-013 | System SHALL display a patient detail view with full profile and history timeline | MUST | — |
| FR-PA-014 | System SHALL use soft-delete (is_deleted flag) — never hard-delete patient records | MUST | — |
| FR-PA-015 | System SHOULD calculate and display patient age from date of birth | SHOULD | — |
| FR-PA-016 | System SHOULD support CSV import for bulk patient migration | COULD | — |

### 2.3 Appointment Management (APT)

| ID | Requirement | Priority | Business Rule |
|---|---|---|---|
| FR-AP-001 | System SHALL allow scheduling an appointment by selecting patient, dentist, date, and time slot | MUST | — |
| FR-AP-002 | System SHALL auto-generate appointment number in format APT-YYYY-NNNNN | MUST | BR-A03 |
| FR-AP-003 | System SHALL prevent double-booking: no two appointments for the same dentist may overlap | MUST | BR-A01 |
| FR-AP-004 | System SHALL only allow appointments during dentist working hours | MUST | BR-A02 |
| FR-AP-005 | System SHALL prevent creating appointments with past dates | MUST | BR-A06 |
| FR-AP-006 | System SHALL enforce minimum 15-minute appointment duration | MUST | BR-A07 |
| FR-AP-007 | System SHALL display available time slots when a dentist and date are selected | MUST | — |
| FR-AP-008 | System SHALL allow rescheduling an appointment to a new date/time | MUST | — |
| FR-AP-009 | System SHALL allow cancelling an appointment with a mandatory reason | MUST | BR-A04 |
| FR-AP-010 | System SHALL NOT allow reinstating cancelled appointments | MUST | BR-A04 |
| FR-AP-011 | System SHALL support statuses: SCHEDULED, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW | MUST | BR-A05 |
| FR-AP-012 | System SHALL provide a "Today's Appointments" view | MUST | — |
| FR-AP-013 | System SHALL provide a "Future Appointments" view with date filtering | MUST | — |
| FR-AP-014 | System SHALL allow searching appointments by number, patient, dentist, date, status | MUST | — |
| FR-AP-015 | System SHALL allow marking an appointment as NO_SHOW | SHOULD | — |
| FR-AP-016 | System SHALL allow confirming a SCHEDULED appointment | SHOULD | — |

### 2.4 Dentist Management (DEN)

| ID | Requirement | Priority | Business Rule |
|---|---|---|---|
| FR-DE-001 | System SHALL store dentist profiles: Full Name, Specialization, Qualifications, License Number, Telephone, Email, Joined Date, Consultation Fee | MUST | — |
| FR-DE-002 | System SHALL auto-generate dentist code in format DEN-NNNNN | MUST | — |
| FR-DE-003 | System SHALL link each dentist to a user account with DENTIST role | MUST | — |
| FR-DE-004 | System SHALL allow configuring working hours per day of week (start time, end time, available flag) | MUST | — |
| FR-DE-005 | System SHALL display dentist availability based on schedule and existing appointments | MUST | — |
| FR-DE-006 | System SHALL display all appointments assigned to a dentist | MUST | — |
| FR-DE-007 | System SHALL support dentist statuses: ACTIVE, ON_LEAVE, INACTIVE | MUST | — |
| FR-DE-008 | System SHALL enforce license number uniqueness | MUST | — |

### 2.5 Treatment Management (TRT)

| ID | Requirement | Priority | Business Rule |
|---|---|---|---|
| FR-TR-001 | System SHALL store treatments: Treatment Code, Name, Type, Description, Estimated Duration (minutes), Standard Charge | MUST | — |
| FR-TR-002 | System SHALL auto-generate treatment code in format TRT-NNNNN | MUST | — |
| FR-TR-003 | System SHALL categorize treatments: PREVENTIVE, RESTORATIVE, COSMETIC, SURGICAL, ORTHODONTIC | MUST | — |
| FR-TR-004 | System SHALL allow activating/deactivating treatments | MUST | — |
| FR-TR-005 | System SHALL display treatment catalogue with search and filtering | MUST | — |
| FR-TR-006 | System SHALL only allow active treatments to be added to visits | MUST | — |

### 2.6 Patient Visit (VIS)

| ID | Requirement | Priority | Business Rule |
|---|---|---|---|
| FR-VI-001 | System SHALL create a visit record linked to an appointment, patient, and dentist | MUST | — |
| FR-VI-002 | System SHALL auto-generate visit number in format VIS-YYYY-NNNNN | MUST | — |
| FR-VI-003 | System SHALL allow recording: Diagnosis, Prescription, Dentist Notes | MUST | — |
| FR-VI-004 | System SHALL allow adding one or more treatments to a visit with quantity and actual charge | MUST | — |
| FR-VI-005 | System SHALL support treatment status: PLANNED, IN_PROGRESS, COMPLETED, FOLLOW_UP_REQUIRED | MUST | — |
| FR-VI-006 | System SHALL allow setting a follow-up date | MUST | — |
| FR-VI-007 | System SHALL update appointment status to IN_PROGRESS when visit starts | MUST | — |
| FR-VI-008 | System SHALL update appointment status to COMPLETED when visit completes | MUST | — |
| FR-VI-009 | System SHALL notify receptionist when a visit is completed (ready for billing) | SHOULD | — |

### 2.7 Billing (BIL)

| ID | Requirement | Priority | Business Rule |
|---|---|---|---|
| FR-BI-001 | System SHALL auto-generate a bill from a completed visit | MUST | BR-B01 |
| FR-BI-002 | System SHALL auto-generate bill number in format INV-YYYY-NNNNN | MUST | BR-B06 |
| FR-BI-003 | System SHALL auto-calculate: Consultation Fee + Treatment Total − Discount + Tax = Final Total | MUST | BR-B02 |
| FR-BI-004 | System SHALL populate consultation fee from dentist's profile | MUST | — |
| FR-BI-005 | System SHALL calculate treatment total as SUM(charge × quantity) for all visit treatments | MUST | — |
| FR-BI-006 | System SHALL allow applying a discount (percentage, max 50%) | MUST | BR-B03 |
| FR-BI-007 | System SHALL apply configurable tax rate (default 0%) | MUST | BR-B04 |
| FR-BI-008 | System SHALL support payment statuses: PENDING, PAID, PARTIALLY_PAID, REFUNDED | MUST | — |
| FR-BI-009 | System SHALL prevent modification of PAID bills | MUST | BR-B05 |
| FR-BI-010 | System SHALL record payment method: CASH, CARD, BANK_TRANSFER | MUST | — |
| FR-BI-011 | System SHALL generate a downloadable PDF receipt | MUST | — |
| FR-BI-012 | System SHALL generate a printable invoice | MUST | — |
| FR-BI-013 | System SHALL display billing history per patient | MUST | — |

### 2.8 Search System (SRC)

| ID | Requirement | Priority | Business Rule |
|---|---|---|---|
| FR-SR-001 | System SHALL provide global search across all entities | MUST | — |
| FR-SR-002 | System SHALL support search by: Appointment Number, Patient Name, NIC, Telephone, Dentist, Date, Treatment | MUST | — |
| FR-SR-003 | System SHALL return results within 500ms | MUST | — |
| FR-SR-004 | System SHALL display results with links to detail pages | MUST | — |
| FR-SR-005 | System SHOULD provide type-ahead search suggestions | SHOULD | — |

### 2.9 Reports (RPT)

| ID | Requirement | Priority | Business Rule |
|---|---|---|---|
| FR-RP-001 | System SHALL generate Daily Appointments Report | MUST | — |
| FR-RP-002 | System SHALL generate Monthly Revenue Report | MUST | — |
| FR-RP-003 | System SHALL generate Dentist Performance Report (appointments, revenue per dentist) | MUST | — |
| FR-RP-004 | System SHALL generate Popular Treatments Report (treatment frequency ranking) | MUST | — |
| FR-RP-005 | System SHALL generate Patient Statistics Report (registrations, demographics) | MUST | — |
| FR-RP-006 | System SHALL generate Cancelled Appointments Report | MUST | — |
| FR-RP-007 | System SHALL display a Revenue Dashboard with charts | MUST | — |
| FR-RP-008 | System SHALL allow exporting any report to PDF | MUST | — |
| FR-RP-009 | System SHALL allow exporting any report to Excel | SHOULD | — |
| FR-RP-010 | System SHALL allow date range filtering on all reports | MUST | — |

### 2.10 Help Centre (HLP)

| ID | Requirement | Priority | Business Rule |
|---|---|---|---|
| FR-HL-001 | System SHALL provide step-by-step instructions for each module | MUST | — |
| FR-HL-002 | System SHALL include a User Guide with screenshots | MUST | — |
| FR-HL-003 | System SHALL include a FAQ section | MUST | — |
| FR-HL-004 | System SHALL be searchable | SHOULD | — |

### 2.11 Settings (SET)

| ID | Requirement | Priority | Business Rule |
|---|---|---|---|
| FR-SE-001 | System SHALL allow admin to configure clinic details (name, address, phone, email, logo) | MUST | — |
| FR-SE-002 | System SHALL allow admin to configure treatment prices | MUST | — |
| FR-SE-003 | System SHALL allow admin to manage user accounts (create, activate, deactivate, reset password) | MUST | — |
| FR-SE-004 | System SHALL allow admin to configure system preferences (tax rate, appointment slot duration, dark mode default) | MUST | — |
| FR-SE-005 | System SHALL restrict settings access to ADMIN role only | MUST | — |

### 2.12 Dashboard (DSH)

| ID | Requirement | Priority | Business Rule |
|---|---|---|---|
| FR-DS-001 | System SHALL display role-appropriate dashboard upon login | MUST | — |
| FR-DS-002 | Admin dashboard SHALL show: Today's appointments count, total patients, monthly revenue, pending bills, recent activity | MUST | — |
| FR-DS-003 | Receptionist dashboard SHALL show: Today's appointments, upcoming appointments, recent registrations | MUST | — |
| FR-DS-004 | Dentist dashboard SHALL show: Today's schedule, pending visits, recent visits | MUST | — |
| FR-DS-005 | System SHALL display revenue chart (last 6 months) on admin dashboard | MUST | — |
| FR-DS-006 | System SHALL display appointment status distribution chart | SHOULD | — |

### 2.13 Audit & Notifications (AUD)

| ID | Requirement | Priority | Business Rule |
|---|---|---|---|
| FR-AD-001 | System SHALL log all CREATE, UPDATE, DELETE operations with username, timestamp, entity, old/new values | MUST | BR-S05 |
| FR-AD-002 | System SHALL log LOGIN and LOGOUT events | MUST | BR-S03 |
| FR-AD-003 | System SHALL provide an audit log viewer (admin only) with filtering by user, date, entity, action | MUST | — |
| FR-AD-004 | System SHALL provide in-app notifications for key events (appointment created, visit completed) | SHOULD | — |
| FR-AD-005 | System SHALL display unread notification count in header | SHOULD | — |
| FR-AD-006 | System SHALL allow marking notifications as read | SHOULD | — |

---

## 3. Requirements Traceability Matrix

| Requirement | Use Case | Business Rule | Entity | Test Case |
|---|---|---|---|---|
| FR-AU-001 | UC-01 | — | User | TC-AU-001 |
| FR-AU-003 | UC-01 | BR-S02 | User | TC-AU-003 |
| FR-AU-006 | UC-01 | BR-S03 | User | TC-AU-006 |
| FR-PA-001 | UC-05 | — | Patient | TC-PA-001 |
| FR-PA-003 | UC-05 | BR-P01 | Patient | TC-PA-003 |
| FR-PA-011 | UC-11 | BR-P06 | Patient, Appointment | TC-PA-011 |
| FR-AP-001 | UC-11 | — | Appointment | TC-AP-001 |
| FR-AP-003 | UC-11 | BR-A01 | Appointment | TC-AP-003 |
| FR-AP-009 | UC-13 | BR-A04 | Appointment | TC-AP-009 |
| FR-VI-001 | UC-28 | — | PatientVisit | TC-VI-001 |
| FR-VI-004 | UC-31 | — | VisitTreatment | TC-VI-004 |
| FR-BI-001 | UC-34 | BR-B01 | Bill | TC-BI-001 |
| FR-BI-003 | UC-34 | BR-B02 | Bill | TC-BI-003 |
| FR-BI-006 | UC-35 | BR-B03 | Bill | TC-BI-006 |
| FR-BI-009 | UC-36 | BR-B05 | Bill | TC-BI-009 |
| FR-BI-011 | UC-38 | — | Bill | TC-BI-011 |
| FR-RP-001 | UC-40 | — | Appointment | TC-RP-001 |
| FR-RP-002 | UC-41 | — | Bill | TC-RP-002 |
| FR-AD-001 | UC-52 | BR-S05 | AuditLog | TC-AD-001 |

**Total: 117 Functional Requirements across 13 modules.**
