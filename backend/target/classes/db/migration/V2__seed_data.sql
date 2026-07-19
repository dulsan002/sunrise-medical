-- Seed Administrator User (Password: Admin@123)
INSERT INTO users (username, password_hash, full_name, email, telephone, role, is_active, created_by)
VALUES ('admin', '$2a$12$ljwK9u00yOTcbv624.VqMeDfe5GgzOLV2rJCJeAdnjYjk34TiBF9u', 'Clinic Administrator', 'admin@sunrisedental.com', '+94112345678', 'ADMIN', TRUE, 'SYSTEM');

-- Seed Receptionist User (Password: Recep@123)
INSERT INTO users (username, password_hash, full_name, email, telephone, role, is_active, created_by)
VALUES ('receptionist', '$2a$12$ljwK9u00yOTcbv624.VqMeDfe5GgzOLV2rJCJeAdnjYjk34TiBF9u', 'Lead Receptionist', 'recep@sunrisedental.com', '+94112345679', 'RECEPTIONIST', TRUE, 'SYSTEM');

-- Seed Dentist User (Password: Dentist@123)
INSERT INTO users (username, password_hash, full_name, email, telephone, role, is_active, created_by)
VALUES ('dentist1', '$2a$12$ljwK9u00yOTcbv624.VqMeDfe5GgzOLV2rJCJeAdnjYjk34TiBF9u', 'Dr. Emily Chen', 'emily@sunrisedental.com', '+94112345680', 'DENTIST', TRUE, 'SYSTEM');

INSERT INTO users (username, password_hash, full_name, email, telephone, role, is_active, created_by)
VALUES ('dentist2', '$2a$12$ljwK9u00yOTcbv624.VqMeDfe5GgzOLV2rJCJeAdnjYjk34TiBF9u', 'Dr. Kavin Perera', 'kavin@sunrisedental.com', '+94112345681', 'DENTIST', TRUE, 'SYSTEM');

-- Seed Dentists Profile
INSERT INTO dentists (dentist_code, user_id, full_name, specialization, qualifications, license_number, telephone, email, joined_date, status, consultation_fee, created_by)
VALUES ('DEN-00001', 3, 'Dr. Emily Chen', 'Orthodontics', 'BDS (Colombo), MSc (London)', 'SLMC-D-84920', '+94112345680', 'emily@sunrisedental.com', '2024-01-15', 'ACTIVE', 2000.00, 'SYSTEM');

INSERT INTO dentists (dentist_code, user_id, full_name, specialization, qualifications, license_number, telephone, email, joined_date, status, consultation_fee, created_by)
VALUES ('DEN-00002', 4, 'Dr. Kavin Perera', 'Endodontics', 'BDS (Peradeniya), FDSRCS (UK)', 'SLMC-D-91023', '+94112345681', 'kavin@sunrisedental.com', '2024-03-01', 'ACTIVE', 2500.00, 'SYSTEM');

-- Seed Dentist Weekly Schedules
-- Dr. Emily Chen (DEN-00001) - Monday, Wednesday, Friday
INSERT INTO dentist_schedules (dentist_id, day_of_week, start_time, end_time, is_available)
VALUES (1, 'MONDAY', '08:00:00', '16:00:00', TRUE);
INSERT INTO dentist_schedules (dentist_id, day_of_week, start_time, end_time, is_available)
VALUES (1, 'WEDNESDAY', '08:00:00', '16:00:00', TRUE);
INSERT INTO dentist_schedules (dentist_id, day_of_week, start_time, end_time, is_available)
VALUES (1, 'FRIDAY', '08:00:00', '16:00:00', TRUE);

-- Dr. Kavin Perera (DEN-00002) - Tuesday, Thursday, Saturday
INSERT INTO dentist_schedules (dentist_id, day_of_week, start_time, end_time, is_available)
VALUES (2, 'TUESDAY', '09:00:00', '17:00:00', TRUE);
INSERT INTO dentist_schedules (dentist_id, day_of_week, start_time, end_time, is_available)
VALUES (2, 'THURSDAY', '09:00:00', '17:00:00', TRUE);
INSERT INTO dentist_schedules (dentist_id, day_of_week, start_time, end_time, is_available)
VALUES (2, 'SATURDAY', '09:00:00', '13:00:00', TRUE);

-- Seed Core Treatment Catalog
INSERT INTO treatments (treatment_code, treatment_name, treatment_type, description, estimated_duration_minutes, standard_charge, status, created_by)
VALUES ('TRT-00001', 'Routine Checkup & Scale', 'PREVENTIVE', 'Full mouth clinical examination, scaling, and polishing.', 20, 2500.00, 'ACTIVE', 'SYSTEM');

INSERT INTO treatments (treatment_code, treatment_name, treatment_type, description, estimated_duration_minutes, standard_charge, status, created_by)
VALUES ('TRT-00002', 'Dental Restoration (Filling)', 'RESTORATIVE', 'Composite aesthetic restoration of tooth cavity.', 30, 4500.00, 'ACTIVE', 'SYSTEM');

INSERT INTO treatments (treatment_code, treatment_name, treatment_type, description, estimated_duration_minutes, standard_charge, status, created_by)
VALUES ('TRT-00003', 'Root Canal Therapy', 'RESTORATIVE', 'Pulpectomy and obturation of root canal system.', 60, 22000.00, 'ACTIVE', 'SYSTEM');

INSERT INTO treatments (treatment_code, treatment_name, treatment_type, description, estimated_duration_minutes, standard_charge, status, created_by)
VALUES ('TRT-00004', 'Surgical Extraction', 'SURGICAL', 'Surgical removal of impacted or fractured tooth root.', 45, 6500.00, 'ACTIVE', 'SYSTEM');

INSERT INTO treatments (treatment_code, treatment_name, treatment_type, description, estimated_duration_minutes, standard_charge, status, created_by)
VALUES ('TRT-00005', 'Orthodontic Consultation', 'ORTHODONTIC', 'Clinical evaluation, study models, and treatment planning.', 30, 3500.00, 'ACTIVE', 'SYSTEM');

-- Seed Global Clinic Settings
INSERT INTO clinic_settings (setting_key, setting_value, category, description, updated_by)
VALUES ('clinic_name', 'Sunrise Dental Clinic', 'GENERAL', 'The legal operating name of the dental clinic.', 'SYSTEM');

INSERT INTO clinic_settings (setting_key, setting_value, category, description, updated_by)
VALUES ('clinic_address', '102, Flower Road, Colombo 07, Sri Lanka', 'GENERAL', 'The physical address printed on invoices.', 'SYSTEM');

INSERT INTO clinic_settings (setting_key, setting_value, category, description, updated_by)
VALUES ('clinic_telephone', '+94112345678', 'GENERAL', 'Clinic landline number.', 'SYSTEM');

INSERT INTO clinic_settings (setting_key, setting_value, category, description, updated_by)
VALUES ('clinic_tax_percentage', '0.00', 'BILLING', 'VAT/NBT tax rate applied to billing sub-totals.', 'SYSTEM');

INSERT INTO clinic_settings (setting_key, setting_value, category, description, updated_by)
VALUES ('appt_min_slot_minutes', '15', 'APPOINTMENT', 'Minimum slot duration constraint in minutes.', 'SYSTEM');
