# UML Design Document — Sunrise Dental Clinic Management System

**Document ID:** SDC-UML-001  
**Version:** 1.0  
**Date:** 14 July 2026  
**Project:** Sunrise Dental Clinic Management System (SDCMS)  
**Author:** UML Expert — Vareka Engineering Team  
**Status:** Awaiting Approval  

---

## 1. Introduction

This document contains the PlantUML specifications for the system's core design. These specifications complement the Mermaid diagrams generated in Phase 1 and satisfy the requirements for enterprise-grade modeling.

---

## 2. System Context Diagram (PlantUML)

```plantuml
@startuml
title SDCMS System Context

actor "Receptionist" as Rec
actor "Dentist" as Den
actor "Administrator" as Admin
boundary "SDCMS Application" as App
database "PostgreSQL Database" as DB
entity "Printer" as Print
entity "Email Server" as Email

Rec --> App : "Register patients, schedule appointments, billing"
Den --> App : "Record visits, view schedule, write notes"
Admin --> App : "Manage users, settings, view reports & audit"
App --> DB : "JDBC / Persistent storage"
App --> Print : "Output invoices & receipts"
App --> Email : "Delivers reminders"
@endum
```

---

## 3. Use Case Diagram (PlantUML)

```plantuml
@startuml
left to right direction
skinparam packageStyle rect

actor "Receptionist" as Rec
actor "Dentist" as Den
actor "Administrator" as Admin

rectangle "Sunrise Dental Clinic Management System" {
    usecase "UC-01: Login" as UC01
    usecase "UC-05: Register Patient" as UC05
    usecase "UC-11: Schedule Appointment" as UC11
    usecase "UC-28: Record Patient Visit" as UC28
    usecase "UC-34: Generate Bill" as UC34
    usecase "UC-41: Monthly Revenue Report" as UC41
    usecase "UC-50: Manage Users" as UC50
    usecase "UC-51: Configure Settings" as UC51
    usecase "UC-52: View Audit Logs" as UC52
}

Rec --> UC01
Rec --> UC05
Rec --> UC11
Rec --> UC34

Den --> UC01
Den --> UC28

Admin --> UC01
Admin --> UC05
Admin --> UC11
Admin --> UC28
Admin --> UC34
Admin --> UC41
Admin --> UC50
Admin --> UC51
Admin --> UC52
@endum
```

---

## 4. Entity Relationship Diagram (PlantUML)

```plantuml
@startuml
skinparam linetype ortho

entity "users" {
    * user_id : bigint <<PK>>
    --
    * username : varchar(50) <<UK>>
    * password_hash : varchar(255)
    * role : varchar(20)
    * is_active : boolean
}

entity "patients" {
    * patient_id : bigint <<PK>>
    --
    * patient_code : varchar(20) <<UK>>
    * full_name : varchar(100)
    * nic : varchar(12) <<UK>>
    * telephone : varchar(15)
    * status : varchar(10)
    * is_deleted : boolean
}

entity "dentists" {
    * dentist_id : bigint <<PK>>
    --
    * dentist_code : varchar(20) <<UK>>
    user_id : bigint <<FK>>
    * license_number : varchar(50) <<UK>>
    * consultation_fee : decimal(12,2)
}

entity "appointments" {
    * appointment_id : bigint <<PK>>
    --
    * appointment_number : varchar(20) <<UK>>
    * patient_id : bigint <<FK>>
    * dentist_id : bigint <<FK>>
    * appointment_date : date
    * start_time : time
    * end_time : time
    * status : varchar(20)
}

entity "patient_visits" {
    * visit_id : bigint <<PK>>
    --
    * visit_number : varchar(20) <<UK>>
    appointment_id : bigint <<FK>>
    * patient_id : bigint <<FK>>
    * dentist_id : bigint <<FK>>
    * visit_date : date
    diagnosis : text
    prescription : text
}

entity "bills" {
    * bill_id : bigint <<PK>>
    --
    * bill_number : varchar(20) <<UK>>
    visit_id : bigint <<FK>>
    * patient_id : bigint <<FK>>
    * final_total : decimal(12,2)
    * payment_status : varchar(20)
}

users ||--o| dentists : "has profile"
patients ||--o{ appointments : "books"
dentists ||--o{ appointments : "assigned to"
appointments ||--o| patient_visits : "results in"
patients ||--o{ patient_visits : "attends"
dentists ||--o{ patient_visits : "conducts"
patient_visits ||--o| bills : "generates"
patients ||--o{ bills : "pays"
@endum
```

---

## 5. Domain Class Diagram (PlantUML)

```plantuml
@startuml
title SDCMS Class Diagram

class User {
    - userId : Long
    - username : String
    - passwordHash : String
    - role : Role
    - isActive : boolean
    + authenticate(password: String) : boolean
    + changePassword(oldPwd: String, newPwd: String) : void
}

enum Role {
    RECEPTIONIST
    DENTIST
    ADMIN
}

class Patient {
    - patientId : Long
    - patientCode : String
    - fullName : String
    - nic : String
    - telephone : String
    - status : PatientStatus
    - isDeleted : boolean
    + getAge() : int
    + deactivate() : void
}

enum PatientStatus {
    ACTIVE
    INACTIVE
    DECEASED
}

class Dentist {
    - dentistId : Long
    - dentistCode : String
    - user : User
    - licenseNumber : String
    - consultationFee : BigDecimal
    + isAvailableOn(day: DayOfWeek) : boolean
}

class Appointment {
    - appointmentId : Long
    - appointmentNumber : String
    - patient : Patient
    - dentist : Dentist
    - appointmentDate : LocalDate
    - startTime : LocalTime
    - endTime : LocalTime
    - status : AppointmentStatus
    + cancel(reason: String) : void
    + reschedule(newDate: LocalDate, newTime: LocalTime) : void
}

enum AppointmentStatus {
    SCHEDULED
    CONFIRMED
    IN_PROGRESS
    COMPLETED
    CANCELLED
    NO_SHOW
}

class PatientVisit {
    - visitId : Long
    - visitNumber : String
    - appointment : Appointment
    - patient : Patient
    - dentist : Dentist
    - visitDate : LocalDate
    - diagnosis : String
    - prescription : String
    + addTreatment(treatment: Treatment, qty: int, fee: BigDecimal) : void
    + complete() : void
}

class Bill {
    - billId : Long
    - billNumber : String
    - visit : PatientVisit
    - patient : Patient
    - consultationFee : BigDecimal
    - finalTotal : BigDecimal
    - paymentStatus : PaymentStatus
    + calculateTotals() : void
    + markPaid(method: PaymentMethod) : void
}

User "1" --> "1" Role
Patient "1" --> "1" PatientStatus
Dentist "1" *-- "1" User
Patient "1" -- "*" Appointment
Dentist "1" -- "*" Appointment
Appointment "1" --> "1" AppointmentStatus
Appointment "1" -- "0..1" PatientVisit
PatientVisit "1" -- "0..1" Bill
Patient "1" -- "*" Bill
@endum
```

---

## 6. Sequence Diagram — Appointment Scheduling (PlantUML)

```plantuml
@startuml
actor Receptionist as R
participant "React UI" as UI
participant "AppointmentController" as Ctrl
participant "AppointmentService" as Svc
participant "AppointmentRepository" as Repo
database PostgreSQL as DB

R -> UI : Select patient, dentist, date, slot
UI -> Ctrl : POST /api/v1/appointments {patientId, dentistId, date, slot}
activate Ctrl
Ctrl -> Svc : createAppointment(dto)
activate Svc
Svc -> Svc : validateSchedulingRules(dto)
Svc -> Repo : checkConflicts(dentistId, date, start, end)
activate Repo
Repo -> DB : SELECT COUNT(*) FROM appointments ...
DB --> Repo : count
Repo --> Svc : count
deactivate Repo

alt No Conflict
    Svc -> Svc : generateAppointmentNumber()
    Svc -> Repo : save(appointment)
    Repo -> DB : INSERT INTO appointments
    Svc --> Ctrl : AppointmentDetails
    Ctrl --> UI : 201 Created (JSON)
    UI --> R : Show Success Toast
else Conflict Found
    Svc --> Ctrl : AppointmentConflictException
    deactivate Svc
    Ctrl --> UI : 409 Conflict (Error JSON)
    deactivate Ctrl
    UI --> R : Show Conflict Message + Alternatives
end
@endum
```

---

## 7. Package Diagram (PlantUML)

```plantuml
@startuml
package "Presentation Layer (React / Vite)" as PL {
    [Views / Pages]
    [Components]
    [Axios API Client]
}

package "Controller Layer" as CL {
    [REST Controllers]
    [Security Filters]
}

package "Service Layer" as SL {
    [Business Services]
    [Data Transfer Objects]
}

package "Repository Layer" as RL {
    [JPA Repositories]
}

package "Database Layer" as DL {
    [PostgreSQL DB]
}

PL ..> CL : HTTP REST / JSON
CL ..> SL : Dependency Inversion
SL ..> RL : JPA Entities
RL ..> DL : SQL/JDBC
@endum
```

---

## 8. Component Diagram (PlantUML)

```plantuml
@startuml
package "Client Browser" {
    [React Single Page Application] as SPA
}

package "Backend Server (Spring Boot)" {
    [Security Manager] as Security
    [REST API Engine] as Controllers
    [Business Logic Component] as Services
    [Data Access Engine] as Repositories
}

database "PostgreSQL" {
    [Clinic Database Tables] as DB
}

SPA --> Security : Request with JWT
Security --> Controllers : Authorized route
Controllers --> Services : Call business methods
Services --> Repositories : Query records
Repositories --> DB : Execute SQL
@endum
```

---

## 9. Deployment Diagram (PlantUML)

```plantuml
@startuml
node "Client Desktop / Tablet" {
    node "Web Browser" {
        component "React Client App" as React
    }
}

node "Docker Host (Local Server / VM)" {
    node "Frontend Container (Nginx)" {
        component "Nginx Web Server" as Nginx
    }
    node "Backend Container (Tomcat)" {
        component "Spring Boot API" as Spring
    }
    node "Database Container (PostgreSQL)" {
        database "PostgreSQL DB" as PG
    }
}

React ..> Nginx : HTTP / HTTPS (Port 80/443)
Nginx ..> Spring : Proxy /api/* (Port 8080)
Spring ..> PG : JDBC Connection (Port 5432)
@endum
```

---

> **PHASE 5: UML DESIGN — COMPLETED**
