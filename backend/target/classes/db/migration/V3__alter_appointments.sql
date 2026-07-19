ALTER TABLE appointments ADD COLUMN treatment_id BIGINT;
ALTER TABLE appointments ADD CONSTRAINT fk_appt_treatment FOREIGN KEY (treatment_id) REFERENCES treatments(treatment_id) ON DELETE RESTRICT;
