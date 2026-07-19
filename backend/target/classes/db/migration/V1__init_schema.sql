-- 1. Create Users Table
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

-- 2. Create Patients Table
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

-- 3. Create Dentists Table
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

-- 4. Create Dentist Schedules Table
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

-- 5. Create Treatments Table
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

-- 6. Create Appointments Table
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

-- 7. Create Patient Visits Table
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

-- 8. Create Visit Treatments Table
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

-- 9. Create Bills Table
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

-- 10. Create Audit Logs Table
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

-- 11. Create Notifications Table
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

-- 12. Create Clinic Settings Table
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

-- 13. Create helper triggers and procedures
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_dentists_updated_at BEFORE UPDATE ON dentists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_treatments_updated_at BEFORE UPDATE ON treatments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_visits_updated_at BEFORE UPDATE ON patient_visits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_bills_updated_at BEFORE UPDATE ON bills FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 14. Create Stored Functions
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
    SELECT dentist_id INTO v_dentist_id FROM patient_visits WHERE visit_id = p_visit_id;
    SELECT consultation_fee INTO r_consultation_fee FROM dentists WHERE dentist_id = v_dentist_id;
    
    IF r_consultation_fee IS NULL THEN
        r_consultation_fee := 0.00;
    END IF;

    SELECT COALESCE(SUM(charge * quantity), 0.00) INTO r_treatment_total 
    FROM visit_treatments 
    WHERE visit_id = p_visit_id;

    r_sub_total := r_consultation_fee + r_treatment_total;
    r_discount_amount := ROUND(r_sub_total * (p_discount_percentage / 100.0), 2);
    r_tax_amount := ROUND((r_sub_total - r_discount_amount) * (p_tax_percentage / 100.0), 2);
    r_final_total := r_sub_total - r_discount_amount + r_tax_amount;
END;
$$ LANGUAGE plpgsql;

-- 15. Create Custom Views
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
