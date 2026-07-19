# Sunrise Dental Clinic Management System (SDCMS)

Enterprise-grade dental clinic management system replacing paper-based operations at Sunrise Dental Clinic, Colombo.

## 🏗️ Technology Stack

| Layer | Technology |
|---|---|
| **Backend** | Java 21, Spring Boot 3.3, Spring Security 6, Spring Data JPA |
| **Frontend** | React 18, TypeScript, Vite, Material UI 5, Recharts |
| **Database** | PostgreSQL 15, Flyway Migrations |
| **Security** | JWT (HS512), BCrypt (strength 12), RBAC |
| **Deployment** | Docker Compose, Nginx, GitHub Actions CI/CD |

## 🚀 Quick Start

### Method 1: Using Docker (Recommended - Easiest for Clients!)
Requires Docker and Docker Compose installed and running.

**For Windows Users:**
Simply double-click the `start-docker.bat` file in the project folder.

**For Mac/Linux Users:**
```bash
# 1. Enter the application directory
cd sunrise-medical

# 2. Launch all services
./start-docker.sh
```

### Method 2: Manual Startup (Without Docker)

#### Prerequisites
If you do not have the required underlying tools installed on your system, please download and install them first:
- **Java 21**: [Download JDK 21](https://adoptium.net/temurin/releases/?version=21)
- **Node.js & npm (v20+)**: [Download Node.js](https://nodejs.org/)
- **PostgreSQL (v15+)**: [Download PostgreSQL](https://www.postgresql.org/download/)
*(Note: Maven is no longer required to be installed manually, as the project now includes the Maven Wrapper).*

#### One-Click Startup Script
We have provided an automated script that securely fetches all required dependencies for both the frontend and backend, and boots them up concurrently.

**For Windows Users:**
1. Ensure PostgreSQL is running with database `sdcms_db`, user `sdcms_user`, password `sdcms_password`.
2. Double-click `start-dev.bat`.

**For Mac/Linux Users:**
```bash
# 1. Database Setup
We have provided an automated script to create the database.
**Windows:** Double-click `setup-db.bat` and enter your main Postgres password.
**Mac/Linux:** Run `./setup-db.sh` and enter your main Postgres password.

# 2. Run the Startup Script
cd sunrise-medical
./start-dev.sh
```
*Note: Press `CTRL+C` at any time to safely shut down both servers.*

#### Fully Manual Execution (Terminal)
If you prefer to run the frontend and backend manually in separate terminal windows instead of using the script:

**Terminal 1 (Backend):**
```bash
cd backend
./mvnw clean install "-DskipTests"
./mvnw spring-boot:run "-Dspring-boot.run.profiles=dev"
```
*(Windows users: Use `mvnw.cmd` instead of `./mvnw`)*

**Terminal 2 (Frontend):**
```bash
cd frontend
npm install
npm run dev
```

#### Accessing the Application
- **Frontend Web App**: http://localhost:5173
- **Backend API Docs**: http://localhost:8080/swagger-ui.html
- **Default Login**: `admin` / `Admin@123`

## 📁 Project Structure

```text
sunrise-medical/
├── backend/          → Spring Boot REST API
├── frontend/         → React SPA (Vite + TypeScript)
├── docs/
│   ├── business-analysis/
│   ├── requirements/
│   ├── architecture/
│   ├── database-design/
│   ├── testing/
│   ├── user-manual/
│   └── admin-manual/
├── docker-compose.yml
├── .github/workflows/ci.yml
└── .env.example
```

## 👥 User Roles

| Role | Access |
|---|---|
| **Administrator** | Full system access, reports, user management, settings |
| **Receptionist** | Patients, appointments, billing |
| **Dentist** | Patient visits, treatment records, own schedule |

## 📋 Documentation

- [Business Analysis](docs/business-analysis/business-analysis.md)
- [Vision Document](docs/business-analysis/vision-document.md)
- [SRS — Functional](docs/requirements/srs-part1-functional.md)
- [SRS — Non-Functional & API](docs/requirements/srs-part2-nonfunctional-api.md)
- [System Architecture](docs/architecture/architecture-design.md)
- [Database Design](docs/database-design/database-design.md)
- [UML Design](docs/architecture/uml-design.md)
- [UI/UX Design](docs/architecture/ui-ux-design.md)
- [Test Strategy](docs/testing/test-strategy.md)
- [User Manual](docs/user-manual/user-manual.md)
- [Admin Manual](docs/admin-manual/admin-manual.md)

## 📄 License

© 2026 Sunrise Dental Clinic — All Rights Reserved.
