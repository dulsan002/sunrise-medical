# SDCMS Enterprise Diagrams — Part 3: Workflows & Sequences

**Document ID:** SDC-DIA-003 | **Version:** 1.0 | **Date:** 14 July 2026

---

## 1. Authentication Flow (Login → JWT → Access)

```mermaid
sequenceDiagram
    actor U as User
    participant FE as React Frontend
    participant AF as JwtAuthFilter
    participant AC as AuthController
    participant AS as AuthService
    participant UD as UserDetailsService
    participant JP as JwtTokenProvider
    participant UR as UserRepository
    participant AL as AuditLogService
    participant DB as PostgreSQL

    U->>FE: Enter username & password
    FE->>AC: POST /api/auth/login {username, password}
    AC->>AS: authenticate(loginRequest)
    AS->>UD: loadUserByUsername(username)
    UD->>UR: findByUsername(username)
    UR->>DB: SELECT * FROM users WHERE username = ?
    DB-->>UR: User record
    UR-->>UD: User entity
    UD-->>AS: UserDetails

    alt Password matches (BCrypt verify)
        AS->>AS: resetFailedAttempts()
        AS->>JP: generateToken(userDetails)
        JP-->>AS: JWT access token (8hr expiry)
        AS->>AL: log(LOGIN, userId, SUCCESS)
        AL->>DB: INSERT INTO audit_logs
        AS-->>AC: AuthResponse{token, role, fullName}
        AC-->>FE: 200 OK {token, role, fullName}
        FE->>FE: Store token in localStorage
        FE->>FE: Redirect to Dashboard
    else Password fails
        AS->>AS: incrementFailedAttempts()
        alt failedAttempts >= 5
            AS->>AS: lockAccount()
        end
        AS->>AL: log(LOGIN, userId, FAILED)
        AS-->>AC: AuthenticationException
        AC-->>FE: 401 Unauthorized
        FE->>U: Display error message
    end

    Note over FE,AF: Subsequent Authenticated Requests
    U->>FE: Navigate to protected page
    FE->>AF: GET /api/patients (Header: Bearer <token>)
    AF->>JP: validateToken(token)
    JP-->>AF: Valid + UserDetails
    AF->>AF: Set SecurityContext
    AF->>AC: Forward to Controller
```

**Design Decisions:**
- BCrypt strength ≥ 12 for password hashing (BR-S01)
- JWT expires after 8 hours (BR-S02)
- Account locks after 5 failed attempts (BR-S03)
- Every login attempt is audit-logged (BR-S05)

---

## 2. Appointment Scheduling Workflow

```mermaid
sequenceDiagram
    actor R as Receptionist
    participant FE as React Frontend
    participant AC as AppointmentController
    participant AS as AppointmentService
    participant PS as PatientService
    participant DS as DentistService
    participant AR as AppointmentRepository
    participant NS as NotificationService
    participant AL as AuditLogService
    participant DB as PostgreSQL

    R->>FE: Click "New Appointment"
    FE->>AC: GET /api/patients/search?q=John
    AC->>PS: searchPatients("John")
    PS->>DB: SELECT * FROM patients WHERE name LIKE '%John%' AND status='ACTIVE'
    DB-->>FE: Patient list

    R->>FE: Select patient, select dentist, select date
    FE->>AC: GET /api/dentists/{id}/availability?date=2026-07-15
    AC->>DS: getAvailableSlots(dentistId, date)
    DS->>DB: SELECT * FROM dentist_schedules WHERE dentist_id=? AND day_of_week=?
    DS->>DB: SELECT * FROM appointments WHERE dentist_id=? AND date=? AND status NOT IN ('CANCELLED')
    DS->>DS: Calculate free slots (exclude booked times)
    DS-->>FE: Available time slots

    R->>FE: Select 10:00-10:30 slot
    FE->>AC: POST /api/appointments {patientId, dentistId, date, startTime, endTime}
    AC->>AS: createAppointment(dto)
    AS->>AS: Validate patient is ACTIVE (BR-P06)
    AS->>AS: Validate date is not in past (BR-A06)
    AS->>AS: Validate within working hours (BR-A02)
    AS->>AS: Validate minimum 15min duration (BR-A07)
    AS->>AR: existsConflict(dentistId, date, startTime, endTime)

    alt No conflict
        AS->>AS: Generate APT-2026-00001 (BR-A03)
        AS->>AR: save(appointment)
        AR->>DB: INSERT INTO appointments
        AS->>NS: notify(dentistUserId, "New appointment scheduled")
        AS->>AL: log(CREATE, APPOINTMENT, appointmentId)
        AS-->>FE: 201 Created {appointmentNumber}
        FE->>R: Show success confirmation
    else Conflict detected (BR-A01)
        AS-->>FE: 409 Conflict {message, alternativeSlots}
        FE->>R: Show conflict error + alternative slots
    end
```

---

## 3. Billing & Payment Workflow

```mermaid
sequenceDiagram
    actor R as Receptionist
    participant FE as React Frontend
    participant BC as BillController
    participant BS as BillService
    participant VS as VisitService
    participant PDF as PdfService
    participant BR as BillRepository
    participant AL as AuditLogService
    participant DB as PostgreSQL

    R->>FE: Open completed visit → Click "Generate Bill"
    FE->>BC: POST /api/bills {visitId}
    BC->>BS: generateBill(visitId)
    BS->>VS: getVisitWithTreatments(visitId)
    VS->>DB: SELECT visit + treatments + dentist
    VS-->>BS: Visit with treatments list

    BS->>BS: consultationFee = dentist.consultationFee
    BS->>BS: treatmentTotal = SUM(visitTreatment.charge * quantity)
    BS->>BS: subTotal = consultationFee + treatmentTotal (BR-B02)
    BS->>BS: Generate INV-2026-00001 (BR-B06)
    BS->>BR: save(bill) with status PENDING
    BS->>AL: log(CREATE, BILL, billId)
    BS-->>FE: 201 Created {bill details}

    R->>FE: Apply 10% discount
    FE->>BC: PATCH /api/bills/{id}/discount {percentage: 10}
    BC->>BS: applyDiscount(billId, 10)
    BS->>BS: Validate discount <= 50% (BR-B03)
    BS->>BS: discountAmount = subTotal * 0.10
    BS->>BS: taxAmount = (subTotal - discountAmount) * taxRate (BR-B04)
    BS->>BS: finalTotal = subTotal - discountAmount + taxAmount
    BS->>BR: update(bill)
    BS-->>FE: 200 OK {updated bill}

    R->>FE: Click "Record Payment"
    FE->>BC: PATCH /api/bills/{id}/pay {method: "CASH"}
    BC->>BS: recordPayment(billId, "CASH")
    BS->>BS: Set status = PAID, paymentDate = now()
    BS->>BR: update(bill)
    BS->>AL: log(UPDATE, BILL, billId)
    BS-->>FE: 200 OK {paid bill}

    R->>FE: Click "Download PDF"
    FE->>BC: GET /api/bills/{id}/pdf
    BC->>PDF: generateReceipt(billId)
    PDF->>DB: Load bill + patient + visit + treatments
    PDF->>PDF: Render professional PDF template
    PDF-->>FE: application/pdf byte stream
    FE->>R: Download PDF receipt
```

---

## 4. Patient Visit & Treatment Recording

```mermaid
sequenceDiagram
    actor D as Dentist
    participant FE as React Frontend
    participant VC as VisitController
    participant VS as VisitService
    participant AS as AppointmentService
    participant NS as NotificationService
    participant AL as AuditLogService
    participant DB as PostgreSQL

    D->>FE: View today's appointments → Select patient
    FE->>VC: POST /api/visits {appointmentId}
    VC->>VS: createVisit(appointmentId)
    VS->>AS: updateStatus(appointmentId, IN_PROGRESS)
    VS->>VS: Generate VIS-2026-00001
    VS->>DB: INSERT INTO patient_visits
    VS-->>FE: 201 Created {visit}

    D->>FE: Add diagnosis text
    FE->>VC: PATCH /api/visits/{id} {diagnosis: "Dental caries on tooth 36"}
    VC->>VS: updateVisit(visitId, dto)
    VS->>DB: UPDATE patient_visits SET diagnosis = ?
    VS-->>FE: 200 OK

    D->>FE: Add treatments performed
    FE->>VC: POST /api/visits/{id}/treatments {treatmentId, quantity: 1, charge: 5000}
    VC->>VS: addTreatment(visitId, treatmentDto)
    VS->>DB: INSERT INTO visit_treatments
    VS-->>FE: 201 Created

    D->>FE: Add prescription
    FE->>VC: PATCH /api/visits/{id} {prescription: "Amoxicillin 500mg TDS x 5 days"}
    VS->>DB: UPDATE patient_visits SET prescription = ?

    D->>FE: Set follow-up date & complete visit
    FE->>VC: PATCH /api/visits/{id} {followUpDate: "2026-07-28", treatmentStatus: "COMPLETED"}
    VS->>AS: updateStatus(appointmentId, COMPLETED)
    VS->>NS: notify(receptionistUsers, "Visit completed - ready for billing")
    VS->>AL: log(UPDATE, PATIENT_VISIT, visitId)
    VS-->>FE: 200 OK
```

---

## 5. Appointment State Machine

```mermaid
stateDiagram-v2
    [*] --> SCHEDULED: Receptionist creates appointment

    SCHEDULED --> CONFIRMED: Receptionist confirms
    SCHEDULED --> CANCELLED: Receptionist/Patient cancels
    SCHEDULED --> NO_SHOW: Patient did not arrive

    CONFIRMED --> IN_PROGRESS: Dentist starts visit
    CONFIRMED --> CANCELLED: Receptionist/Patient cancels
    CONFIRMED --> NO_SHOW: Patient did not arrive

    IN_PROGRESS --> COMPLETED: Dentist completes visit

    CANCELLED --> [*]: Terminal state
    NO_SHOW --> [*]: Terminal state
    COMPLETED --> [*]: Terminal state

    note right of SCHEDULED: Auto-generated APT number\nBR-A03
    note right of CANCELLED: Reason required\nCannot reinstate (BR-A04)
    note right of COMPLETED: Triggers visit record\nand billing workflow
```

---

## 6. Bill Payment State Machine

```mermaid
stateDiagram-v2
    [*] --> PENDING: Bill auto-generated from completed visit

    PENDING --> PAID: Full payment received
    PENDING --> PARTIALLY_PAID: Partial payment received

    PARTIALLY_PAID --> PAID: Remaining balance paid
    PARTIALLY_PAID --> REFUNDED: Refund issued

    PAID --> REFUNDED: Full refund issued
    PAID --> [*]: Immutable once PAID (BR-B05)

    REFUNDED --> [*]: Terminal state

    note right of PENDING: Auto-calculated totals\nINV-YYYY-NNNNN format
    note right of PAID: Cannot modify amounts\nPDF receipt available
```

---

## 7. Patient Status State Machine

```mermaid
stateDiagram-v2
    [*] --> ACTIVE: Patient registered

    ACTIVE --> INACTIVE: Admin deactivates (BR-P05)
    ACTIVE --> DECEASED: Marked deceased

    INACTIVE --> ACTIVE: Admin reactivates
    INACTIVE --> DECEASED: Marked deceased

    DECEASED --> [*]: Terminal state

    note right of ACTIVE: Can book appointments
    note right of INACTIVE: Cannot book new appointments (BR-P06)\nExisting records preserved
    note right of DECEASED: All data retained for records\nNo new operations permitted
```

---

## 8. Activity Diagram — End-to-End Patient Journey

```mermaid
flowchart TD
    START(("🟢 Start")) --> A1["Patient arrives at clinic"]
    A1 --> A2{"New patient?"}

    A2 -->|Yes| A3["Receptionist registers patient"]
    A3 --> A4["System validates NIC uniqueness"]
    A4 --> A5{"Validation passed?"}
    A5 -->|No| A6["Show error - fix data"]
    A6 --> A3
    A5 -->|Yes| A7["Patient saved with PAT-YYYY-NNNNN"]

    A2 -->|No| A8["Receptionist searches by NIC/Name"]
    A8 --> A9["Load existing patient profile"]

    A7 --> A10["Schedule Appointment"]
    A9 --> A10

    A10 --> A11["Select dentist and date"]
    A11 --> A12["System shows available slots"]
    A12 --> A13["Select time slot"]
    A13 --> A14{"Conflict?"}
    A14 -->|Yes| A12
    A14 -->|No| A15["Appointment created - APT-YYYY-NNNNN"]

    A15 --> A16["Patient waits / returns on appointment date"]
    A16 --> A17["Dentist starts visit"]
    A17 --> A18["Record diagnosis"]
    A18 --> A19["Record treatments performed"]
    A19 --> A20["Write prescription"]
    A20 --> A21{"Follow-up needed?"}
    A21 -->|Yes| A22["Set follow-up date"]
    A21 -->|No| A23["Complete visit"]
    A22 --> A23

    A23 --> A24["Receptionist generates bill"]
    A24 --> A25["System auto-calculates totals"]
    A25 --> A26{"Apply discount?"}
    A26 -->|Yes| A27["Enter discount percentage"]
    A27 --> A28["System recalculates"]
    A26 -->|No| A28
    A28 --> A29["Record payment"]
    A29 --> A30{"Print receipt?"}
    A30 -->|Yes| A31["Generate PDF receipt"]
    A30 -->|No| A32["Done"]
    A31 --> A32

    A32 --> ENDD(("🔴 End"))

    style START fill:#51cf66,color:#fff
    style ENDD fill:#ff6b6b,color:#fff
    style A7 fill:#4c6ef5,color:#fff
    style A15 fill:#4c6ef5,color:#fff
    style A23 fill:#4c6ef5,color:#fff
    style A29 fill:#4c6ef5,color:#fff
```

---

## 9. Navigation Diagram (Frontend Page Flow)

```mermaid
flowchart TD
    LOGIN["Login Page"] --> DASH["Dashboard"]

    DASH --> PAT["Patient Management"]
    DASH --> APT["Appointment Management"]
    DASH --> DEN["Dentist Management"]
    DASH --> TRT["Treatment Management"]
    DASH --> VIS["Visit Management"]
    DASH --> BIL["Billing"]
    DASH --> RPT["Reports"]
    DASH --> SRCH["Global Search"]
    DASH --> HELP["Help Centre"]
    DASH --> SET["Settings"]
    DASH --> AUDIT["Audit Logs"]
    DASH --> NOTIF["Notifications"]
    DASH --> PROF["Profile"]

    PAT --> PAT_LIST["Patient List"]
    PAT --> PAT_ADD["Add Patient Form"]
    PAT --> PAT_VIEW["Patient Detail View"]
    PAT_VIEW --> PAT_HIST["Patient History Timeline"]

    APT --> APT_LIST["Appointments List"]
    APT --> APT_TODAY["Today's Appointments"]
    APT --> APT_ADD["Schedule Appointment"]
    APT --> APT_VIEW["Appointment Detail"]

    DEN --> DEN_LIST["Dentist List"]
    DEN --> DEN_ADD["Add Dentist"]
    DEN --> DEN_VIEW["Dentist Profile + Schedule"]

    VIS --> VIS_LIST["Visits List"]
    VIS --> VIS_REC["Record Visit"]
    VIS --> VIS_VIEW["Visit Detail"]

    BIL --> BIL_LIST["Bills List"]
    BIL --> BIL_GEN["Generate Bill"]
    BIL --> BIL_VIEW["Invoice Detail"]
    BIL_VIEW --> BIL_PDF["PDF Receipt Download"]

    RPT --> RPT_DAILY["Daily Report"]
    RPT --> RPT_REV["Revenue Report"]
    RPT --> RPT_PERF["Dentist Performance"]
    RPT --> RPT_POP["Popular Treatments"]
    RPT --> RPT_STAT["Patient Statistics"]

    SET --> SET_CLINIC["Clinic Details"]
    SET --> SET_PRICE["Treatment Prices"]
    SET --> SET_USER["User Accounts"]
    SET --> SET_PREF["Preferences"]

    PROF --> PROF_EDIT["Edit Profile"]
    PROF --> PROF_PWD["Change Password"]

    style LOGIN fill:#ff6b6b,color:#fff
    style DASH fill:#4c6ef5,color:#fff
```

---

## 10. Communication Diagram — Appointment Creation

```mermaid
flowchart LR
    R["👤 Receptionist"] -->|"1: createAppointment()"| AC["AppointmentController"]
    AC -->|"2: validate(dto)"| V["Validator"]
    AC -->|"3: createAppointment(dto)"| AS["AppointmentService"]
    AS -->|"4: findById(patientId)"| PS["PatientService"]
    AS -->|"5: findById(dentistId)"| DS["DentistService"]
    AS -->|"6: checkConflict()"| AR["AppointmentRepository"]
    AR -->|"7: SQL query"| DB["PostgreSQL"]
    AS -->|"8: save(appointment)"| AR
    AS -->|"9: log(CREATE)"| AL["AuditLogService"]
    AS -->|"10: notify(dentist)"| NS["NotificationService"]
    AS -->|"11: return response"| AC
    AC -->|"12: 201 Created"| R

    style R fill:#51cf66,color:#fff
    style DB fill:#fcc419,color:#000
```

---

## Diagram Index

| # | Diagram | Type | File |
|---|---|---|---|
| 1 | Entity Relationship Diagram | ER | Part 1 |
| 2 | Domain Class Diagram | Class | Part 1 |
| 3 | System Context Diagram | Context | Part 2 |
| 4 | Use Case Diagram (56 use cases) | Use Case | Part 2 |
| 5 | Use Case Specifications | Specification | Part 2 |
| 6 | Package Diagram | Package | Part 2 |
| 7 | Deployment Diagram | Deployment | Part 2 |
| 8 | Component Diagram | Component | Part 2 |
| 9 | Authentication Sequence | Sequence | Part 3 |
| 10 | Appointment Scheduling Sequence | Sequence | Part 3 |
| 11 | Billing & Payment Sequence | Sequence | Part 3 |
| 12 | Patient Visit Sequence | Sequence | Part 3 |
| 13 | Appointment State Machine | State | Part 3 |
| 14 | Bill Payment State Machine | State | Part 3 |
| 15 | Patient Status State Machine | State | Part 3 |
| 16 | End-to-End Patient Journey | Activity | Part 3 |
| 17 | Navigation Diagram | Navigation | Part 3 |
| 18 | Communication Diagram | Communication | Part 3 |
| **Total** | **18 enterprise-level Mermaid diagrams** | | |
