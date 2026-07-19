# Administrator & Maintenance Manual — SDCMS

**Document ID:** SDC-ADM-001 | **Version:** 1.0 | **Date:** 14 July 2026  
**Audience:** System Administrators, DevOps Engineers

---

## 1. System Requirements

| Component | Minimum | Recommended |
|---|---|---|
| **Java** | JDK 21 | JDK 21 (Eclipse Temurin) |
| **Node.js** | v18.x | v20.x LTS |
| **PostgreSQL** | 14 | 15 |
| **Docker** | 24.x | 26.x |
| **Docker Compose** | v2.20 | v2.28 |
| **RAM** | 4 GB | 8 GB |
| **Disk** | 10 GB | 20 GB |
| **OS** | Ubuntu 22.04 / Windows 10 | Ubuntu 24.04 LTS |

---

## 2. Installation & Setup

### 2.1 Clone Repository
```bash
git clone https://github.com/vareka/sdcms.git
cd sdcms
```

### 2.2 Environment Configuration
Create `.env` file in the project root:
```env
# Database
POSTGRES_DB=sdcms_db
POSTGRES_USER=sdcms_user
POSTGRES_PASSWORD=<STRONG_PASSWORD>

# Backend
SPRING_PROFILES_ACTIVE=prod
JWT_SECRET=<64_CHAR_HEX_SECRET>
JWT_EXPIRATION_MS=28800000

# Frontend
VITE_API_BASE_URL=/api/v1
```

### 2.3 Docker Compose Deployment (Recommended)
```bash
docker compose up -d --build
```
This starts three containers:
- `sdcms-db` — PostgreSQL 15 on port 5432
- `sdcms-backend` — Spring Boot API on port 8080
- `sdcms-frontend` — Nginx serving React on port 80

### 2.4 Manual Development Setup
```bash
# Terminal 1: Database
docker run -d --name sdcms-db -p 5432:5432 \
  -e POSTGRES_DB=sdcms_db \
  -e POSTGRES_USER=sdcms_user \
  -e POSTGRES_PASSWORD=sdcms_password \
  postgres:15

# Terminal 2: Backend
cd backend
./mvnw spring-boot:run -Dspring.profiles.active=dev

# Terminal 3: Frontend
cd frontend
npm install
npm run dev
```

---

## 3. User Account Management

### 3.1 Creating Users
1. Login as **Administrator**.
2. Navigate to **Settings** → **User Management**.
3. Click **+ Create User**.
4. Enter: Username, Full Name, Email, Telephone, Role, Initial Password.
5. Click **Save**. The password is hashed with BCrypt (strength 12).

### 3.2 Unlocking Accounts
1. Navigate to **User Management**.
2. Find the locked user (indicated by 🔒 icon).
3. Click **Unlock Account**.
4. The `is_locked` flag is reset to `false` and `failed_login_attempts` is reset to `0`.

### 3.3 Resetting Passwords
1. Navigate to **User Management** → select user.
2. Click **Reset Password**.
3. Enter the new password (must meet policy requirements).
4. The user must change their password on next login.

### 3.4 Deactivating Users
1. Navigate to **User Management** → select user.
2. Click **Deactivate**. Deactivated users cannot login.

### 3.5 Role Permissions Management
1. Navigate to **User Management**.
2. Select the **Role Permissions** tab at the top.
3. Switch between **ADMIN Permissions**, **RECEPTIONIST Permissions**, and **DENTIST Permissions** tabs.
4. View the permission matrix mapping resources (APPOINTMENTS, PATIENTS, VISITS, etc.) to CRUD permissions.
5. Toggle checkboxes to grant/revoke access and click **Save Permissions** to apply. Changes take effect immediately and are logged in the audit trail.

---

## 4. System Configuration

### 4.1 Clinic Settings
Navigate to **Settings** → **Clinic Details**:

| Setting Key | Description | Example |
|---|---|---|
| `clinic_name` | Business name on invoices | Sunrise Dental Clinic |
| `clinic_address` | Address on invoices | 102, Flower Road, Colombo 07 |
| `clinic_telephone` | Contact number | +94112345678 |
| `clinic_tax_percentage` | Tax rate applied to bills | 0.00 |
| `appt_min_slot_minutes` | Minimum appointment duration | 15 |

### 4.2 Treatment Pricing
Navigate to **Treatments** to update standard charges. Changes apply to **new bills only** — existing invoices retain their original pricing.

---

## 5. Database Administration

### 5.1 Backup Strategy
```bash
# Full database backup
docker exec sdcms-db pg_dump -U sdcms_user sdcms_db > backup_$(date +%Y%m%d).sql

# Compressed backup
docker exec sdcms-db pg_dump -U sdcms_user -F c sdcms_db > backup_$(date +%Y%m%d).dump
```

### 5.2 Restore from Backup
```bash
# From SQL file
docker exec -i sdcms-db psql -U sdcms_user sdcms_db < backup_20260714.sql

# From compressed dump
docker exec -i sdcms-db pg_restore -U sdcms_user -d sdcms_db backup_20260714.dump
```

### 5.3 Database Migrations
Flyway manages all schema changes automatically on application startup. To check migration status:
```bash
cd backend
./mvnw flyway:info -Dflyway.url=jdbc:postgresql://localhost:5432/sdcms_db
```

### 5.4 Key Database Indexes
| Index | Table | Purpose |
|---|---|---|
| `idx_patients_nic` | patients | Fast NIC lookups (unique, conditional) |
| `idx_appointments_date_time` | appointments | Daily schedule queries |
| `idx_appt_dentist_date` | appointments | Conflict detection |
| `idx_audit_timestamp` | audit_logs | Chronological audit queries |
| `idx_bills_status` | bills | Payment status filtering |

---

## 6. Monitoring & Troubleshooting

### 6.1 Application Health Check
```bash
curl http://localhost:8080/api/v1/actuator/health
```

### 6.2 Log Files
| Component | Log Location |
|---|---|
| Backend (Docker) | `docker logs sdcms-backend` |
| Backend (Local) | `backend/logs/sdcms.log` |
| PostgreSQL | `docker logs sdcms-db` |
| Nginx | `docker logs sdcms-frontend` |

### 6.3 Common Issues

| Issue | Cause | Resolution |
|---|---|---|
| Login returns 401 | Wrong credentials or locked account | Verify password; unlock via admin panel |
| 409 on appointment creation | Time slot conflict | Check dentist availability for that date/time |
| Database connection refused | PostgreSQL container not running | `docker compose up -d sdcms-db` |
| Frontend shows blank page | Backend API unreachable | Verify backend is running on port 8080 |
| Flyway migration error | Schema drift | Check `flyway_schema_history` table; resolve conflicts |

### 6.4 Performance Tuning
- **Connection Pool:** HikariCP default pool size is 10. Increase `spring.datasource.hikari.maximum-pool-size` for heavy load.
- **JVM Memory:** Set `-Xmx512m -Xms256m` in Dockerfile for optimal memory usage.
- **PostgreSQL:** Tune `shared_buffers`, `work_mem`, and `effective_cache_size` for production workloads.

---

## 7. Security Checklist

- [ ] Change default admin password on first login
- [ ] Replace JWT secret with a cryptographically random 128-char hex string
- [ ] Enable HTTPS via reverse proxy (Nginx / Caddy)
- [ ] Restrict CORS origins to production domain only
- [ ] Set up automated daily database backups
- [ ] Review audit logs weekly for suspicious activity
- [ ] Keep Docker images and dependencies updated
- [ ] Never expose PostgreSQL port (5432) to the public internet

---

> **END OF ADMINISTRATOR MANUAL**
