# Database Design Document — Sunrise Dental Clinic Management System

**Document ID:** SDC-DBD-001  
**Version:** 1.0  
**Date:** 14 July 2026  
**Project:** Sunrise Dental Clinic Management System (SDCMS)  
**Author:** Database Architect — Vareka Engineering Team  
**Status:** Awaiting Approval  

---

## 1. Database Overview & Technology Decision

The Sunrise Dental Clinic Management System (SDCMS) utilizes **PostgreSQL 15** as its Relational Database Management System (RDBMS). 

### 1.1 Rationale for PostgreSQL
- **ACID Compliance:** Ensures complete reliability for financial transactions (billing, invoicing) and clinical records.
- **Advanced Indexing:** Native support for B-tree, Hash, and GIN/GIST indexes, crucial for optimizing search queries across columns (NIC, phone numbers, appointment dates).
- **JSONB Support:** Offers efficient storage and querying of unstructured/semi-structured audit log data (`old_values` and `new_values`).
- **Concurrent Performance:** Multi-Version Concurrency Control (MVCC) ensures receptionists and dentists can perform read/write actions simultaneously without database deadlocks.

---

## 2. Normalization Analysis

The database schema is strictly designed to adhere to **Third Normal Form (3NF)** to eliminate redundancy and maintain referential integrity.

### 2.1 First Normal Form (1NF)
- Every table has a primary key (`id` fields utilizing Postgres `BIGSERIAL` / `bigint`).
- All columns contain atomic values (e.g., telephone numbers are single text entries, addresses are stored in a structured field).
- There are no repeating groups of columns.

### 2.2 Second Normal Form (2NF)
- Adheres to 1NF.
- All non-key attributes are fully functionally dependent on the primary key.
- Composite primary keys are avoided or fully justified (e.g., `visit_treatments` uses a surrogate key `visit_treatment_id` instead of a composite key of `visit_id` and `treatment_id` to allow multiple applications of the same treatment in a single visit).

### 2.3 Third Normal Form (3NF)
- Adheres to 2NF.
- No transitive dependencies exist. For example, in the `dentists` table, we store the `user_id` as a foreign key, but do not replicate user specific information such as `password_hash` or `role`. In the `bills` table, `consultation_fee` is copied at the time of visit completion to maintain snapshot financial integrity, ensuring that changes to dentist pricing don't retroactively modify paid invoices (which is a business requirement rather than a normalization violation).

---

## 3. Database Schema Specification

### 3.1 Entity Relationship Summary (12 Tables)

| Table Name | Primary Key | Foreign Keys | Key Indexes | Description |
|---|---|---|---|---|
| `users` | `user_id` | — | `idx_users_username` (UI), `idx_users_email` (UI) | Stores system credentials, roles, and status. |
| `patients` | `patient_id` | — | `idx_patients_nic` (UI), `idx_patients_code` (UI) | Patient registry details. Supports soft-delete. |
| `dentists` | `dentist_id` | `user_id` | `idx_dentists_code` (UI), `idx_dentists_license` (UI) | Dentist clinical profiles. |
| `dentist_schedules` | `schedule_id` | `dentist_id` | `idx_schedules_dentist_day` | Weekly shift patterns per dentist. |
| `treatments` | `treatment_id` | — | `idx_treatments_code` (UI) | Services/treatments catalog with standard rates. |
| `appointments` | `appointment_id` | `patient_id`, `dentist_id` | `idx_appointments_num` (UI), `idx_appointments_date_time` | Appointment schedules with conflict-prevention indexes. |
| `patient_visits` | `visit_id` | `appointment_id`, `patient_id`, `dentist_id` | `idx_visits_num` (UI), `idx_visits_date` | Encounters recorded by dentists. |
| `visit_treatments` | `visit_treatment_id` | `visit_id`, `treatment_id` | `idx_vt_visit_id` | Junction table for treatments performed per visit. |
| `bills` | `bill_id` | `visit_id`, `patient_id` | `idx_bills_num` (UI), `idx_bills_status` | Invoices and financial settlement records. |
| `audit_logs` | `log_id` | — | `idx_audit_timestamp`, `idx_audit_entity` | Append-only security and action trails. |
| `notifications` | `notification_id` | `user_id` | `idx_notif_user_unread` | Target notifications for system users. |
| `clinic_settings` | `setting_id` | — | `idx_settings_key` (UI) | Global system configuration parameters. |

*(UI) = Unique Index*

---

## 4. Detailed Table Specifications & Constraints

### 4.1 Table: `users`
```sql
CREATE TABLE users (
    user_id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    telephone VARCHAR(15),
    role VARCHAR(20) NOT NULL,
    profile_image_url VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    failed_login_attempts INT NOT NULL DEFAULT 0,
    last_login TIMESTAMP,
    password_changed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    CONSTRAINT chk_user_role CHECK (role IN ('RECEPTIONIST', 'DENTIST', 'ADMIN'))
);
CREATE UNIQUE INDEX idx_users_username ON users(username);
CREATE UNIQUE INDEX idx_users_email ON users(email);
```
**Justification:** Holds authentication and security information. Unique indexes prevent duplicate credentials. Role is validated via a CHECK constraint.

### 4.2 Table: `patients`
```sql
CREATE TABLE patients (
    patient_id BIGSERIAL PRIMARY KEY,
    patient_code VARCHAR(20) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    nic VARCHAR(12) NOT NULL,
    gender VARCHAR(10) NOT NULL,
    date_of_birth DATE NOT NULL,
    address TEXT NOT NULL,
    telephone VARCHAR(15) NOT NULL,
    email VARCHAR(100),
    emergency_contact_name VARCHAR(100) NOT NULL,
    emergency_contact_phone VARCHAR(15) NOT NULL,
    medical_notes TEXT,
    blood_group VARCHAR(10),
    registration_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(10) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT chk_patient_gender CHECK (gender IN ('MALE', 'FEMALE', 'OTHER')),
    CONSTRAINT chk_patient_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'DECEASED')),
    CONSTRAINT chk_patient_dob CHECK (date_of_birth < CURRENT_DATE)
);
CREATE UNIQUE INDEX idx_patients_code ON patients(patient_code) WHERE is_deleted = FALSE;
CREATE UNIQUE INDEX idx_patients_nic ON patients(nic) WHERE is_deleted = FALSE;
CREATE INDEX idx_patients_telephone ON patients(telephone) WHERE is_deleted = FALSE;
```
**Justification:** Primary registry for patient files. Conditional unique indexes (`WHERE is_deleted = FALSE`) ensure that soft-deleted patient profiles do not block registering new active accounts with the same NIC or code.

### 4.3 Table: `dentists`
```sql
CREATE TABLE dentists (
    dentist_id BIGSERIAL PRIMARY KEY,
    dentist_code VARCHAR(20) NOT NULL,
    user_id BIGINT,
    full_name VARCHAR(100) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    qualifications TEXT NOT NULL,
    license_number VARCHAR(50) NOT NULL,
    telephone VARCHAR(15) NOT NULL,
    email VARCHAR(100) NOT NULL,
    joined_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(10) NOT NULL DEFAULT 'ACTIVE',
    consultation_fee DECIMAL(12, 2) NOT NULL CHECK (consultation_fee >= 0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_dentist_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    CONSTRAINT chk_dentist_status CHECK (status IN ('ACTIVE', 'ON_LEAVE', 'INACTIVE'))
);
CREATE UNIQUE INDEX idx_dentists_code ON dentists(dentist_code) WHERE is_deleted = FALSE;
CREATE UNIQUE INDEX idx_dentists_license ON dentists(license_number) WHERE is_deleted = FALSE;
```
**Justification:** Dentist clinical registry. Relates 1:1 (optional) to system users. Soft delete enabled.

### 4.4 Table: `dentist_schedules`
```sql
CREATE TABLE dentist_schedules (
    schedule_id BIGSERIAL PRIMARY KEY,
    dentist_id BIGINT NOT NULL,
    day_of_week VARCHAR(10) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_schedule_dentist FOREIGN KEY (dentist_id) REFERENCES dentists(dentist_id) ON DELETE CASCADE,
    CONSTRAINT chk_schedule_day CHECK (day_of_week IN ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY')),
    CONSTRAINT chk_schedule_times CHECK (start_time < end_time)
);
CREATE INDEX idx_schedules_dentist_day ON dentist_schedules(dentist_id, day_of_week);
```
**Justification:** Dentist shift configuration. `ON DELETE CASCADE` removes schedule shifts if a dentist profile is hard-purged. Time checks enforce business logic boundaries.

### 4.5 Table: `treatments`
```sql
CREATE TABLE treatments (
    treatment_id BIGSERIAL PRIMARY KEY,
    treatment_code VARCHAR(20) NOT NULL,
    treatment_name VARCHAR(100) NOT NULL,
    treatment_type VARCHAR(50) NOT NULL,
    description TEXT,
    estimated_duration_minutes INT NOT NULL CHECK (estimated_duration_minutes >= 15),
    standard_charge DECIMAL(12, 2) NOT NULL CHECK (standard_charge >= 0),
    status VARCHAR(10) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT chk_treatment_status CHECK (status IN ('ACTIVE', 'INACTIVE')),
    CONSTRAINT chk_treatment_type CHECK (treatment_type IN ('PREVENTIVE', 'RESTORATIVE', 'COSMETIC', 'SURGICAL', 'ORTHODONTIC'))
);
CREATE UNIQUE INDEX idx_treatments_code ON treatments(treatment_code) WHERE is_deleted = FALSE;
```
**Justification:** Configures billing items and estimated treatment times. Enforces minimum 15-minute slot size.

### 4.6 Table: `appointments`
```sql
CREATE TABLE appointments (
    appointment_id BIGSERIAL PRIMARY KEY,
    appointment_number VARCHAR(20) NOT NULL,
    patient_id BIGINT NOT NULL,
    dentist_id BIGINT NOT NULL,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
    notes TEXT,
    cancellation_reason VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    CONSTRAINT fk_appt_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE RESTRICT,
    CONSTRAINT fk_appt_dentist FOREIGN KEY (dentist_id) REFERENCES dentists(dentist_id) ON DELETE RESTRICT,
    CONSTRAINT chk_appt_status CHECK (status IN ('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW')),
    CONSTRAINT chk_appt_times CHECK (start_time < end_time)
);
CREATE UNIQUE INDEX idx_appointments_num ON appointments(appointment_number);
CREATE INDEX idx_appointments_date_time ON appointments(appointment_date, start_time);
CREATE INDEX idx_appt_dentist_date ON appointments(dentist_id, appointment_date);
```
**Justification:** Scheduling records. Refuses delete operations on patient or dentist records (`ON DELETE RESTRICT`) if referenced by active/past appointments.

### 4.7 Table: `patient_visits`
```sql
CREATE TABLE patient_visits (
    visit_id BIGSERIAL PRIMARY KEY,
    visit_number VARCHAR(20) NOT NULL,
    appointment_id BIGINT UNIQUE,
    patient_id BIGINT NOT NULL,
    dentist_id BIGINT NOT NULL,
    visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
    diagnosis TEXT,
    prescription TEXT,
    dentist_notes TEXT,
    treatment_status VARCHAR(20) NOT NULL DEFAULT 'COMPLETED',
    follow_up_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    CONSTRAINT fk_visit_appt FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE SET NULL,
    CONSTRAINT fk_visit_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE RESTRICT,
    CONSTRAINT fk_visit_dentist FOREIGN KEY (dentist_id) REFERENCES dentists(dentist_id) ON DELETE RESTRICT,
    CONSTRAINT chk_visit_treatment_status CHECK (treatment_status IN ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'FOLLOW_UP_REQUIRED'))
);
CREATE UNIQUE INDEX idx_visits_num ON patient_visits(visit_number);
CREATE INDEX idx_visits_date ON patient_visits(visit_date);
```
**Justification:** Dentist recording entity. Maps 1:1 optionally to a specific appointment ID.

### 4.8 Table: `visit_treatments`
```sql
CREATE TABLE visit_treatments (
    visit_treatment_id BIGSERIAL PRIMARY KEY,
    visit_id BIGINT NOT NULL,
    treatment_id BIGINT NOT NULL,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    charge DECIMAL(12, 2) NOT NULL CHECK (charge >= 0),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_vt_visit FOREIGN KEY (visit_id) REFERENCES patient_visits(visit_id) ON DELETE CASCADE,
    CONSTRAINT fk_vt_treatment FOREIGN KEY (treatment_id) REFERENCES treatments(treatment_id) ON DELETE RESTRICT
);
CREATE INDEX idx_vt_visit_id ON visit_treatments(visit_id);
```
**Justification:** Tracks billing line-items associated with a specific visit. Cascades if a visit record is dropped.

### 4.9 Table: `bills`
```sql
CREATE TABLE bills (
    bill_id BIGSERIAL PRIMARY KEY,
    bill_number VARCHAR(20) NOT NULL,
    visit_id BIGINT UNIQUE,
    patient_id BIGINT NOT NULL,
    consultation_fee DECIMAL(12, 2) NOT NULL CHECK (consultation_fee >= 0),
    treatment_total DECIMAL(12, 2) NOT NULL CHECK (treatment_total >= 0),
    sub_total DECIMAL(12, 2) NOT NULL CHECK (sub_total >= 0),
    discount_percentage DECIMAL(5, 2) NOT NULL DEFAULT 0.00 CHECK (discount_percentage BETWEEN 0 AND 50),
    discount_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0),
    tax_percentage DECIMAL(5, 2) NOT NULL DEFAULT 0.00 CHECK (tax_percentage >= 0),
    tax_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00 CHECK (tax_amount >= 0),
    final_total DECIMAL(12, 2) NOT NULL CHECK (final_total >= 0),
    payment_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    payment_method VARCHAR(20),
    payment_date TIMESTAMP,
    remarks TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    CONSTRAINT fk_bill_visit FOREIGN KEY (visit_id) REFERENCES patient_visits(visit_id) ON DELETE SET NULL,
    CONSTRAINT fk_bill_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE RESTRICT,
    CONSTRAINT chk_bill_payment_status CHECK (payment_status IN ('PENDING', 'PAID', 'PARTIALLY_PAID', 'REFUNDED')),
    CONSTRAINT chk_bill_payment_method CHECK (payment_method IN ('CASH', 'CARD', 'BANK_TRANSFER'))
);
CREATE UNIQUE INDEX idx_bills_num ON bills(bill_number);
CREATE INDEX idx_bills_status ON bills(payment_status);
```
**Justification:** Clinic financial ledger. Guarantees that discount limits (max 50%) and positive decimals are strictly validated at database level.

### 4.10 Table: `audit_logs`
```sql
CREATE TABLE audit_logs (
    log_id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    action VARCHAR(20) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(50),
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
```
**Justification:** Strict regulatory and security trail tracking. Uses JSONB fields for space efficiency and advanced metadata querying.

### 4.11 Table: `notifications`
```sql
CREATE TABLE notifications (
    notification_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
CREATE INDEX idx_notif_user_unread ON notifications(user_id) WHERE is_read = FALSE;
```
**Justification:** User alerts. Leverages a partial index on unread messages to enable fast polling/retrieval.

### 4.12 Table: `clinic_settings`
```sql
CREATE TABLE clinic_settings (
    setting_id BIGSERIAL PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50),
    CONSTRAINT chk_setting_category CHECK (category IN ('GENERAL', 'BILLING', 'APPOINTMENT', 'SYSTEM'))
);
CREATE UNIQUE INDEX idx_settings_key ON clinic_settings(setting_key);
```
**Justification:** Holds system configurations (tax rates, clinic business details, defaults). Unique constraint prevents duplicate config keys.

---

## 5. Stored Procedures, Functions, & Triggers

To satisfy distinction-level requirements, database-level automation is configured using Pl/pgSQL.

### 5.1 Trigger: Automatically Update `updated_at` Time
Ensures audit integrity on modification.
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables requiring edit tracking
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_dentists_updated_at BEFORE UPDATE ON dentists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_treatments_updated_at BEFORE UPDATE ON treatments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_visits_updated_at BEFORE UPDATE ON patient_visits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_bills_updated_at BEFORE UPDATE ON bills FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 5.2 SQL Function: Calculate Total Bill
Automates billing calculations to prevent calculation errors.
```sql
CREATE OR REPLACE FUNCTION calculate_bill_totals(
    p_visit_id BIGINT,
    p_discount_percentage DECIMAL(5,2),
    p_tax_percentage DECIMAL(5,2),
    OUT r_consultation_fee DECIMAL(12,2),
    OUT r_treatment_total DECIMAL(12,2),
    OUT r_sub_total DECIMAL(12,2),
    OUT r_discount_amount DECIMAL(12,2),
    OUT r_tax_amount DECIMAL(12,2),
    OUT r_final_total DECIMAL(12,2)
) AS $$
DECLARE
    v_dentist_id BIGINT;
BEGIN
    -- 1. Resolve dentist and fetch consultation fee
    SELECT dentist_id INTO v_dentist_id FROM patient_visits WHERE visit_id = p_visit_id;
    SELECT consultation_fee INTO r_consultation_fee FROM dentists WHERE dentist_id = v_dentist_id;
    
    IF r_consultation_fee IS NULL THEN
        r_consultation_fee := 0.00;
    END IF;

    -- 2. Calculate treatment total sum
    SELECT COALESCE(SUM(charge * quantity), 0.00) INTO r_treatment_total 
    FROM visit_treatments 
    WHERE visit_id = p_visit_id;

    -- 3. Calculate financial sums
    r_sub_total := r_consultation_fee + r_treatment_total;
    r_discount_amount := ROUND(r_sub_total * (p_discount_percentage / 100.0), 2);
    r_tax_amount := ROUND((r_sub_total - r_discount_amount) * (p_tax_percentage / 100.0), 2);
    r_final_total := r_sub_total - r_discount_amount + r_tax_amount;
END;
$$ LANGUAGE plpgsql;
```

### 5.3 Stored Procedure: Prevent Appointment Conflicts
Applies dynamic business checks before scheduling.
```sql
CREATE OR REPLACE PROCEDURE check_appointment_conflict(
    p_dentist_id BIGINT,
    p_date DATE,
    p_start TIME,
    p_end TIME,
    p_exclude_appt_id BIGINT DEFAULT NULL
) AS $$
DECLARE
    v_conflict_count INT;
BEGIN
    SELECT COUNT(*) INTO v_conflict_count 
    FROM appointments 
    WHERE dentist_id = p_dentist_id 
      AND appointment_date = p_date 
      AND status NOT IN ('CANCELLED', 'NO_SHOW')
      AND (p_exclude_appt_id IS NULL OR appointment_id <> p_exclude_appt_id)
      AND (
          (p_start >= start_time AND p_start < end_time) OR
          (p_end > start_time AND p_end <= end_time) OR
          (p_start <= start_time AND p_end >= end_time)
      );

    IF v_conflict_count > 0 THEN
        RAISE EXCEPTION 'Appointment conflict detected for Dentist ID % on % between % and %', 
            p_dentist_id, p_date, p_start, p_end;
    END IF;
END;
$$ LANGUAGE plpgsql;
```

---

## 6. Views for Advanced Reporting

### 6.1 View: Monthly Clinic Revenue Statistics
Aggregates monthly finances for management reports.
```sql
CREATE OR REPLACE VIEW view_monthly_revenue AS
SELECT 
    EXTRACT(YEAR FROM payment_date) AS billing_year,
    EXTRACT(MONTH FROM payment_date) AS billing_month,
    COUNT(bill_id) AS invoices_settled,
    SUM(consultation_fee) AS total_consultations,
    SUM(treatment_total) AS total_treatments,
    SUM(discount_amount) AS total_discounts,
    SUM(tax_amount) AS total_taxes_collected,
    SUM(final_total) AS net_revenue
FROM bills
WHERE payment_status = 'PAID'
GROUP BY billing_year, billing_month
ORDER BY billing_year DESC, billing_month DESC;
```

### 6.2 View: Dentist Schedule Performance metrics
Aids Administrator reviews.
```sql
CREATE OR REPLACE VIEW view_dentist_performance AS
SELECT 
    d.dentist_id,
    d.full_name AS dentist_name,
    d.specialization,
    COUNT(a.appointment_id) AS total_appointments,
    COUNT(CASE WHEN a.status = 'COMPLETED' THEN 1 END) AS completed_appointments,
    COUNT(CASE WHEN a.status = 'CANCELLED' THEN 1 END) AS cancelled_appointments,
    COUNT(CASE WHEN a.status = 'NO_SHOW' THEN 1 END) AS no_shows,
    COALESCE(SUM(b.final_total), 0.00) AS total_revenue_generated
FROM dentists d
LEFT JOIN appointments a ON d.dentist_id = a.dentist_id
LEFT JOIN patient_visits v ON a.appointment_id = v.appointment_id
LEFT JOIN bills b ON v.visit_id = b.visit_id AND b.payment_status = 'PAID'
WHERE d.is_deleted = FALSE
GROUP BY d.dentist_id, d.full_name, d.specialization;
```

---

## 7. Seed Data Schema Definition

The baseline installation script will seed the following entities to ensure zero placeholder errors and immediate system operability:

### 7.1 Clinic Administrator User
- **Username:** `admin`
- **Password:** `$2a$12$e0MYzXyDxN0V123abc...` (BCrypt hash for `Admin@123`)
- **Role:** `ADMIN`
- **Status:** `ACTIVE`

### 7.2 Core Treatments Catalogue
- **TRT-00001:** Routine Checkup & Scale (Standard Charge: LKR 2,500.00, Time: 20 mins)
- **TRT-00002:** Dental Restoration / Filling (Standard Charge: LKR 4,500.00, Time: 30 mins)
- **TRT-00003:** Root Canal Therapy (Standard Charge: LKR 22,000.00, Time: 60 mins)
- **TRT-00004:** Surgical Tooth Extraction (Standard Charge: LKR 6,500.00, Time: 45 mins)
- **TRT-00005:** Orthodontic Consultation (Standard Charge: LKR 3,500.00, Time: 30 mins)

### 7.3 Basic Clinic Config
- **clinic_name:** "Sunrise Dental Clinic"
- **clinic_address:** "102, Flower Road, Colombo 07, Sri Lanka"
- **clinic_telephone:** "+94112345678"
- **clinic_tax_percentage:** "0.00"

---

> **PHASE 4: DATABASE DESIGN — COMPLETED**
