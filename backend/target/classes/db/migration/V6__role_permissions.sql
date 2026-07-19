DROP TABLE IF EXISTS role_permissions CASCADE;

CREATE TABLE role_permissions (
    id BIGSERIAL PRIMARY KEY,
    role VARCHAR(20) NOT NULL,
    resource VARCHAR(50) NOT NULL,
    can_create BOOLEAN NOT NULL DEFAULT FALSE,
    can_read BOOLEAN NOT NULL DEFAULT FALSE,
    can_update BOOLEAN NOT NULL DEFAULT FALSE,
    can_delete BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE (role, resource)
);

-- Seed permissions for ADMIN
INSERT INTO role_permissions (role, resource, can_create, can_read, can_update, can_delete) VALUES
('ADMIN', 'PATIENTS', true, true, true, true),
('ADMIN', 'APPOINTMENTS', true, true, true, true),
('ADMIN', 'VISITS', true, true, true, true),
('ADMIN', 'BILLING', true, true, true, true),
('ADMIN', 'DENTISTS', true, true, true, true),
('ADMIN', 'TREATMENTS', true, true, true, true),
('ADMIN', 'USERS', true, true, true, true);

-- Seed permissions for RECEPTIONIST
INSERT INTO role_permissions (role, resource, can_create, can_read, can_update, can_delete) VALUES
('RECEPTIONIST', 'PATIENTS', true, true, true, false),
('RECEPTIONIST', 'APPOINTMENTS', true, true, true, false),
('RECEPTIONIST', 'VISITS', false, true, false, false),
('RECEPTIONIST', 'BILLING', true, true, true, false),
('RECEPTIONIST', 'DENTISTS', false, true, false, false),
('RECEPTIONIST', 'TREATMENTS', false, true, false, false),
('RECEPTIONIST', 'USERS', false, false, false, false);

-- Seed permissions for DENTIST
INSERT INTO role_permissions (role, resource, can_create, can_read, can_update, can_delete) VALUES
('DENTIST', 'PATIENTS', false, true, false, false),
('DENTIST', 'APPOINTMENTS', false, true, false, false),
('DENTIST', 'VISITS', true, true, true, false),
('DENTIST', 'BILLING', false, true, false, false),
('DENTIST', 'DENTISTS', false, true, false, false),
('DENTIST', 'TREATMENTS', false, true, false, false),
('DENTIST', 'USERS', false, false, false, false);
