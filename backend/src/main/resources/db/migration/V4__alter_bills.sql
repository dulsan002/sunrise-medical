ALTER TABLE bills ADD COLUMN appointment_id BIGINT;
ALTER TABLE bills ADD CONSTRAINT fk_bill_appt FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE SET NULL;
