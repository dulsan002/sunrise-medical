-- Seed Patients with explicit IDs
INSERT INTO patients (patient_id, patient_code, full_name, nic, gender, date_of_birth, address, telephone, email, emergency_contact_name, emergency_contact_phone, status, created_by)
VALUES (1, 'PAT-00001', 'John Doe', '199512345678', 'MALE', '1995-05-12', '123 Galle Road, Colombo 03', '+94771234567', 'john@gmail.com', 'Jane Doe', '+94771234568', 'ACTIVE', 'SYSTEM');

INSERT INTO patients (patient_id, patient_code, full_name, nic, gender, date_of_birth, address, telephone, email, emergency_contact_name, emergency_contact_phone, status, created_by)
VALUES (2, 'PAT-00002', 'Alice Smith', '199298765432', 'FEMALE', '1992-09-24', '45 Main Street, Kandy', '+94779876543', 'alice@gmail.com', 'Bob Smith', '+94779876544', 'ACTIVE', 'SYSTEM');

INSERT INTO patients (patient_id, patient_code, full_name, nic, gender, date_of_birth, address, telephone, email, emergency_contact_name, emergency_contact_phone, status, created_by)
VALUES (3, 'PAT-00003', 'Ravi Perera', '198811223344', 'MALE', '1988-01-30', '88 Flower Road, Colombo 07', '+94771122334', 'ravi@gmail.com', 'Sita Perera', '+94771122335', 'ACTIVE', 'SYSTEM');

-- Reset patient sequence
SELECT setval('patients_patient_id_seq', 3);

-- Seed Appointments with explicit IDs
INSERT INTO appointments (appointment_id, appointment_number, patient_id, dentist_id, treatment_id, appointment_date, start_time, end_time, status, created_by)
VALUES (1, 'APT-100001', 1, 1, 1, CURRENT_DATE, '09:00:00', '09:20:00', 'COMPLETED', 'SYSTEM');

INSERT INTO appointments (appointment_id, appointment_number, patient_id, dentist_id, treatment_id, appointment_date, start_time, end_time, status, created_by)
VALUES (2, 'APT-100002', 2, 2, 2, CURRENT_DATE + INTERVAL '1 day', '10:00:00', '10:30:00', 'SCHEDULED', 'SYSTEM');

INSERT INTO appointments (appointment_id, appointment_number, patient_id, dentist_id, treatment_id, appointment_date, start_time, end_time, status, created_by)
VALUES (3, 'APT-100003', 3, 1, 3, CURRENT_DATE + INTERVAL '2 days', '14:00:00', '15:00:00', 'SCHEDULED', 'SYSTEM');

-- Reset appointments sequence
SELECT setval('appointments_appointment_id_seq', 3);

-- Seed Bills with explicit IDs
INSERT INTO bills (bill_id, bill_number, appointment_id, patient_id, consultation_fee, treatment_total, sub_total, discount_percentage, discount_amount, tax_percentage, tax_amount, final_total, payment_status, payment_method, payment_date, created_by)
VALUES (1, 'INV-200001', 1, 1, 2000.00, 2500.00, 4500.00, 0.00, 0.00, 0.00, 0.00, 4500.00, 'PAID', 'CASH', CURRENT_TIMESTAMP, 'SYSTEM');

-- Reset bills sequence
SELECT setval('bills_bill_id_seq', 1);

-- Seed Patient Visits with explicit IDs
INSERT INTO patient_visits (visit_id, visit_number, appointment_id, patient_id, dentist_id, visit_date, diagnosis, prescription, dentist_notes, treatment_status, created_by)
VALUES (1, 'VIS-300001', 1, 1, 1, CURRENT_DATE - INTERVAL '2 days', 'Mild plaque buildup. Requires scaling and routine scaling checkup.', 'Amoxicillin 500mg, Paracetamol 500mg', 'Advised patient to brush twice daily and floss regularly.', 'COMPLETED', 'SYSTEM');

-- Reset patient_visits sequence
SELECT setval('patient_visits_visit_id_seq', 1);

-- Seed Clinic Settings
DELETE FROM clinic_settings WHERE setting_key IN ('clinic_name', 'clinic_address', 'clinic_phone', 'clinic_email', 'operating_hours');
INSERT INTO clinic_settings (setting_key, setting_value, category, description, updated_by) VALUES
('clinic_name', 'Sunrise Dental Clinic', 'GENERAL', 'Name of the dental clinic', 'SYSTEM'),
('clinic_address', '102, Flower Road, Colombo 07', 'GENERAL', 'Physical address of the clinic', 'SYSTEM'),
('clinic_phone', '+94 11 234 5678', 'GENERAL', 'Contact telephone number', 'SYSTEM'),
('clinic_email', 'info@sunrisedental.lk', 'GENERAL', 'Official contact email', 'SYSTEM'),
('operating_hours', 'Mon - Sat: 8:00 AM - 6:00 PM', 'GENERAL', 'Operating business hours', 'SYSTEM');

-- Seed Notifications
INSERT INTO notifications (user_id, type, title, message, is_read, created_at) VALUES
(1, 'APPOINTMENT', 'New Appointment Scheduled', 'An appointment for patient John Doe has been scheduled with Dr. Emily Chen.', FALSE, CURRENT_TIMESTAMP - INTERVAL '1 hour'),
(1, 'BILLING', 'Invoice Paid Successfully', 'Invoice INV-200001 for Rs. 4500.00 has been paid by John Doe.', FALSE, CURRENT_TIMESTAMP - INTERVAL '2 hours'),
(1, 'SYSTEM', 'System Database Backup Completed', 'The daily automated backup of the Sunrise Dental database was completed successfully.', TRUE, CURRENT_TIMESTAMP - INTERVAL '1 day'),
(2, 'APPOINTMENT', 'New Appointment Scheduled', 'An appointment for patient John Doe has been scheduled with Dr. Emily Chen.', FALSE, CURRENT_TIMESTAMP - INTERVAL '1 hour'),
(3, 'APPOINTMENT', 'New Patient Scheduled', 'You have a new appointment with John Doe today at 09:00 AM.', FALSE, CURRENT_TIMESTAMP - INTERVAL '30 minutes');
