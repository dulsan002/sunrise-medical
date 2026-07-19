# Test Strategy & Test Cases — Sunrise Dental Clinic Management System

**Document ID:** SDC-TST-001 | **Version:** 1.0 | **Date:** 14 July 2026  
**Project:** SDCMS | **Author:** QA Automation Engineer — Vareka Engineering Team

---

## 1. Test Strategy Overview

### 1.1 Testing Levels

| Level | Tool | Scope | Coverage Target |
|---|---|---|---|
| **Unit Tests** | JUnit 5 + Mockito | Service layer business logic | ≥ 80% |
| **Integration Tests** | Spring Boot Test + TestContainers | Controller → Service → Repository chain | All CRUD endpoints |
| **API Tests** | Postman + Newman | Full REST API contract validation | All 74 endpoints |
| **UI Tests** | Manual / Cypress (future) | User flow validation | Critical paths |

### 1.2 Test Naming Convention
```
test_<methodName>_<scenario>_<expectedResult>
```
Example: `test_authenticate_validCredentials_returnsJwtToken`

---

## 2. Unit Test Specifications

### 2.1 AuthService Tests

| Test ID | Test Case | Input | Expected Result |
|---|---|---|---|
| TC-AU-001 | Valid login returns JWT token | `{admin, Admin@123}` | 200 OK, token non-null, role = ADMIN |
| TC-AU-002 | Invalid password returns 401 | `{admin, wrong}` | 401 Unauthorized, failedAttempts incremented |
| TC-AU-003 | Non-existent user returns 401 | `{ghost, pass}` | 401 Unauthorized, BadCredentialsException |
| TC-AU-004 | Locked account returns 423 | User with isLocked=true | 423 Locked, LockedException |
| TC-AU-005 | Deactivated account returns 401 | User with isActive=false | 401 Unauthorized |
| TC-AU-006 | 5th failed attempt locks account | 4 prior failures + 1 bad login | isLocked = true, audit log created |
| TC-AU-007 | Successful login resets failed attempts | User with failedAttempts=3, valid password | failedAttempts = 0, lastLogin updated |

### 2.2 PatientService Tests

| Test ID | Test Case | Input | Expected Result |
|---|---|---|---|
| TC-PA-001 | Create patient with valid data | Full patient DTO | 201 Created, patientCode generated (PAT-YYYY-NNNNN) |
| TC-PA-002 | Duplicate NIC rejected | Existing NIC value | 409 Conflict, DuplicateResourceException |
| TC-PA-003 | Invalid phone format rejected | `123abc` | 400 Bad Request, validation error on telephone |
| TC-PA-004 | Future DOB rejected | `2030-01-01` | 400 Bad Request, validation error |
| TC-PA-005 | Update patient succeeds | Changed fullName | 200 OK, updatedAt changed |
| TC-PA-006 | Soft delete sets is_deleted flag | Valid patient ID | Patient not returned in queries, DB record exists |
| TC-PA-007 | Search by NIC returns match | Existing NIC | 200 OK, 1 result |
| TC-PA-008 | Search by name partial match | `"Per"` | Returns patients containing "Per" |
| TC-PA-009 | Deactivate sets status INACTIVE | Valid active patient | status = INACTIVE |
| TC-PA-010 | INACTIVE patient cannot be scheduled | Patient with status INACTIVE | 422 Unprocessable, BusinessRuleViolation |

### 2.3 AppointmentService Tests

| Test ID | Test Case | Input | Expected Result |
|---|---|---|---|
| TC-AP-001 | Create appointment with valid data | Valid patient, dentist, date, slot | 201 Created, status = SCHEDULED |
| TC-AP-002 | Double-booking prevented | Same dentist, overlapping time | 409 Conflict, AppointmentConflictException |
| TC-AP-003 | Past date rejected | Yesterday's date | 400 Bad Request |
| TC-AP-004 | Outside working hours rejected | 22:00-23:00 on a working day | 400 Bad Request |
| TC-AP-005 | Duration < 15 min rejected | 09:00-09:10 | 400 Bad Request |
| TC-AP-006 | Cancel requires reason | Cancel with empty reason | 400 Bad Request |
| TC-AP-007 | Cancel with reason succeeds | Cancel with "Patient request" | status = CANCELLED, reason stored |
| TC-AP-008 | Cancelled cannot be reinstated | PATCH status on CANCELLED appt | 422 Unprocessable |
| TC-AP-009 | Reschedule updates date/time | New date, new slot | 200 OK, date/time changed |
| TC-AP-010 | Available slots exclude booked times | Dentist with 2 existing bookings | Returns slots minus booked ranges |

### 2.4 BillService Tests

| Test ID | Test Case | Input | Expected Result |
|---|---|---|---|
| TC-BI-001 | Generate bill from completed visit | Valid visit ID | 201 Created, consultation_fee from dentist, treatment_total calculated |
| TC-BI-002 | Bill calculation correct | Consult: 2000, Treatments: 6500, Discount: 10%, Tax: 0% | sub=8500, disc=850, tax=0, final=7650 |
| TC-BI-003 | Discount > 50% rejected | discountPercentage = 60 | 400 Bad Request |
| TC-BI-004 | PAID bill cannot be modified | Update attempt on PAID bill | 422 Unprocessable |
| TC-BI-005 | Mark as PAID records payment date | paymentMethod = CASH | status = PAID, paymentDate set |
| TC-BI-006 | PDF generation succeeds | Valid bill ID | Returns byte array, content-type = application/pdf |

### 2.5 DentistService Tests

| Test ID | Test Case | Input | Expected Result |
|---|---|---|---|
| TC-DE-001 | Create dentist with valid data | Full dentist DTO | 201 Created, dentistCode generated |
| TC-DE-002 | Duplicate license rejected | Existing license number | 409 Conflict |
| TC-DE-003 | Schedule configuration saved | 3 working days with times | 200 OK, 3 schedule records |
| TC-DE-004 | Availability check returns correct slots | Date with 2 existing appointments | Excludes booked ranges |

### 2.6 VisitService Tests

| Test ID | Test Case | Input | Expected Result |
|---|---|---|---|
| TC-VI-001 | Create visit from appointment | Valid appointment ID | 201 Created, appointment status → IN_PROGRESS |
| TC-VI-002 | Add treatment to visit | Valid treatment ID, quantity, charge | Treatment added, total recalculated |
| TC-VI-003 | Complete visit updates appointment | Mark visit complete | appointment status → COMPLETED |
| TC-VI-004 | Follow-up date stored | followUpDate = future date | 200 OK, date persisted |

---

## 3. Integration Test Specifications

### 3.1 API Integration Tests

| Test ID | Endpoint | Method | Auth | Scenario | Expected |
|---|---|---|---|---|---|
| IT-AU-001 | `/auth/login` | POST | None | Valid credentials | 200, JWT returned |
| IT-AU-002 | `/auth/login` | POST | None | Invalid credentials | 401 |
| IT-PA-001 | `/patients` | POST | RECEPTIONIST | Create patient | 201 |
| IT-PA-002 | `/patients` | POST | DENTIST | Create patient (no permission) | 403 |
| IT-PA-003 | `/patients` | GET | RECEPTIONIST | List patients paginated | 200, page structure |
| IT-PA-004 | `/patients/search?q=` | GET | ANY | Search patients | 200, filtered results |
| IT-AP-001 | `/appointments` | POST | RECEPTIONIST | Schedule appointment | 201 |
| IT-AP-002 | `/appointments` | POST | RECEPTIONIST | Double-book same slot | 409 |
| IT-AP-003 | `/appointments/today` | GET | ANY | Today's appointments | 200, list |
| IT-BI-001 | `/bills` | POST | RECEPTIONIST | Generate bill from visit | 201 |
| IT-BI-002 | `/bills/{id}/pay` | PATCH | RECEPTIONIST | Record payment | 200 |
| IT-BI-003 | `/bills/{id}/pdf` | GET | ANY | Download PDF | 200, binary |
| IT-RP-001 | `/reports/monthly-revenue` | GET | ADMIN | Monthly revenue report | 200, data array |
| IT-RP-002 | `/reports/monthly-revenue` | GET | RECEPTIONIST | Report (no permission) | 403 |
| IT-SE-001 | `/settings` | PUT | ADMIN | Update setting | 200 |
| IT-SE-002 | `/settings` | PUT | RECEPTIONIST | Update setting (no permission) | 403 |
| IT-AD-001 | `/audit-logs` | GET | ADMIN | List audit logs | 200, paginated |
| IT-AD-002 | `/audit-logs` | GET | DENTIST | Audit logs (no permission) | 403 |

---

## 4. Security Test Cases

| Test ID | Scenario | Expected |
|---|---|---|
| ST-001 | Access protected endpoint without token | 401 Unauthorized |
| ST-002 | Access protected endpoint with expired token | 401 Unauthorized |
| ST-003 | Access protected endpoint with malformed token | 401 Unauthorized |
| ST-004 | RECEPTIONIST accesses admin-only endpoint | 403 Forbidden |
| ST-005 | DENTIST accesses billing creation | 403 Forbidden |
| ST-006 | SQL injection in search parameter | No data leak, query parameterized |
| ST-007 | XSS payload in patient name field | Sanitized, no script execution |
| ST-008 | Password not returned in any API response | Verify all user responses exclude passwordHash |
| ST-009 | Brute force login (6 rapid attempts) | Account locked after 5th failure |

---

## 5. Postman Collection Structure

```
SDCMS API Collection/
├── 01. Authentication/
│   ├── Login (Admin)
│   ├── Login (Receptionist)
│   ├── Login (Dentist)
│   ├── Login (Invalid Credentials)
│   ├── Login (Locked Account)
│   └── Change Password
├── 02. Patients/
│   ├── Create Patient
│   ├── List Patients (Paginated)
│   ├── Get Patient by ID
│   ├── Search Patients
│   ├── Update Patient
│   └── Deactivate Patient
├── 03. Appointments/
│   ├── Create Appointment
│   ├── Get Today's Appointments
│   ├── Reschedule Appointment
│   ├── Cancel Appointment
│   └── Double-Book Test (Expect 409)
├── 04. Dentists/
│   ├── List Dentists
│   ├── Get Dentist Availability
│   └── Update Schedule
├── 05. Treatments/
│   ├── List Treatments
│   ├── Create Treatment
│   └── Deactivate Treatment
├── 06. Patient Visits/
│   ├── Create Visit from Appointment
│   ├── Add Treatment to Visit
│   └── Complete Visit
├── 07. Billing/
│   ├── Generate Bill
│   ├── Apply Discount
│   ├── Record Payment
│   └── Download PDF Receipt
├── 08. Reports/
│   ├── Daily Appointments
│   ├── Monthly Revenue
│   ├── Dentist Performance
│   └── Popular Treatments
├── 09. Dashboard/
│   ├── Get Summary Stats
│   └── Get Revenue Chart Data
├── 10. Settings/
│   ├── Get All Settings
│   └── Update Setting
├── 11. User Management/
│   ├── List Users
│   ├── Create User
│   └── Deactivate User
└── 12. Audit Logs/
    ├── List Audit Logs
    └── Filter by Entity
```

---

## 6. Test Summary Metrics

| Metric | Target |
|---|---|
| Total Unit Test Cases | 37 |
| Total Integration Test Cases | 18 |
| Total Security Test Cases | 9 |
| Code Coverage (Service Layer) | ≥ 80% |
| All Critical Paths Tested | ✅ |
| Postman Collection Requests | 42 |

---

> **PHASE 9: TESTING — COMPLETED**
