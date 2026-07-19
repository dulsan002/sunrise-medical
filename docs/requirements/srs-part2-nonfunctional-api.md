# Software Requirements Specification — Part 2: Non-Functional Requirements & API Specification

**Document ID:** SDC-SRS-002 | **Version:** 1.0 | **Date:** 14 July 2026  
**Project:** Sunrise Dental Clinic Management System (SDCMS)

---

## 1. Non-Functional Requirements

### 1.1 Performance (PERF)

| ID | Requirement | Target | Priority |
|---|---|---|---|
| NFR-PE-001 | API response time (95th percentile) | < 500ms | MUST |
| NFR-PE-002 | Page load time (initial) | < 3 seconds | MUST |
| NFR-PE-003 | Search results response time | < 500ms | MUST |
| NFR-PE-004 | PDF generation time | < 5 seconds | MUST |
| NFR-PE-005 | Report generation time | < 5 seconds | MUST |
| NFR-PE-006 | Concurrent users supported | ≥ 50 | MUST |
| NFR-PE-007 | Database query execution time | < 200ms | SHOULD |

### 1.2 Security (SEC)

| ID | Requirement | Target | Priority |
|---|---|---|---|
| NFR-SE-001 | All passwords hashed with BCrypt (strength ≥ 12) | Verified | MUST |
| NFR-SE-002 | JWT tokens signed with HS512 algorithm | Verified | MUST |
| NFR-SE-003 | All API endpoints protected except /api/auth/login | Verified | MUST |
| NFR-SE-004 | CORS configured for frontend origin only | Verified | MUST |
| NFR-SE-005 | SQL injection prevention via parameterized queries (JPA) | Zero vulnerabilities | MUST |
| NFR-SE-006 | XSS prevention via input sanitization | Zero vulnerabilities | MUST |
| NFR-SE-007 | CSRF protection on state-changing endpoints | Enabled | SHOULD |
| NFR-SE-008 | Rate limiting on login endpoint | Max 10 requests/min/IP | SHOULD |
| NFR-SE-009 | Sensitive data never logged in plain text | Verified | MUST |
| NFR-SE-010 | HTTPS enforced in production | Verified | MUST |

### 1.3 Reliability (REL)

| ID | Requirement | Target | Priority |
|---|---|---|---|
| NFR-RE-001 | System uptime during operating hours | ≥ 99.5% | MUST |
| NFR-RE-002 | Data integrity on concurrent access | Optimistic locking | MUST |
| NFR-RE-003 | Transaction rollback on failure | Automatic | MUST |
| NFR-RE-004 | Database backup capability | Daily | SHOULD |
| NFR-RE-005 | Graceful error handling (no stack traces to client) | All endpoints | MUST |

### 1.4 Scalability (SCA)

| ID | Requirement | Target | Priority |
|---|---|---|---|
| NFR-SC-001 | Support 100,000+ patient records | Verified via indexing | MUST |
| NFR-SC-002 | Support 500,000+ appointment records | Verified via indexing | MUST |
| NFR-SC-003 | Horizontal scalability via stateless JWT | Architecture ready | SHOULD |
| NFR-SC-004 | Database connection pooling | HikariCP configured | MUST |

### 1.5 Usability (USA)

| ID | Requirement | Target | Priority |
|---|---|---|---|
| NFR-US-001 | System learnable by non-technical staff | < 2 hours training | MUST |
| NFR-US-002 | All forms validate in real-time with inline error messages | All forms | MUST |
| NFR-US-003 | All tables support search, sort, filter, pagination | All tables | MUST |
| NFR-US-004 | Confirmation dialogs for destructive actions | All delete/cancel | MUST |
| NFR-US-005 | Loading indicators for async operations | All API calls | MUST |
| NFR-US-006 | Toast notifications for success/error feedback | All operations | MUST |
| NFR-US-007 | Responsive layout (desktop + tablet) | All pages | MUST |
| NFR-US-008 | Dark mode toggle | User preference | SHOULD |
| NFR-US-009 | Keyboard navigation support | Core forms | SHOULD |

### 1.6 Maintainability (MNT)

| ID | Requirement | Target | Priority |
|---|---|---|---|
| NFR-MN-001 | Layered architecture: Controller → Service → Repository | Enforced | MUST |
| NFR-MN-002 | No business logic in controllers | Enforced | MUST |
| NFR-MN-003 | SOLID principles followed | All classes | MUST |
| NFR-MN-004 | Code coverage | ≥ 80% | MUST |
| NFR-MN-005 | API documented via Swagger/OpenAPI | All endpoints | MUST |
| NFR-MN-006 | Database migrations via Flyway | All schema changes | MUST |
| NFR-MN-007 | Consistent naming conventions | Enforced | MUST |

### 1.7 Portability (PRT)

| ID | Requirement | Target | Priority |
|---|---|---|---|
| NFR-PR-001 | Full-stack deployment via Docker Compose | Single command | MUST |
| NFR-PR-002 | No OS-specific dependencies | Cross-platform | MUST |
| NFR-PR-003 | Environment configuration via .env files | Externalized | MUST |

**Total: 46 Non-Functional Requirements.**

---

## 2. REST API Specification

### 2.1 API Design Conventions

| Convention | Standard |
|---|---|
| Base URL | `/api/v1` |
| Authentication | Bearer JWT in Authorization header |
| Content Type | `application/json` |
| Date Format | ISO 8601 (`yyyy-MM-dd`) |
| DateTime Format | ISO 8601 (`yyyy-MM-ddTHH:mm:ss`) |
| Pagination | `?page=0&size=10&sort=field,asc` |
| Error Format | `{status, message, timestamp, errors[]}` |
| HTTP Status Codes | 200 OK, 201 Created, 204 No Content, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 500 Internal Server Error |

### 2.2 Endpoint Catalogue

#### Authentication (`/api/v1/auth`)

| Method | Endpoint | Description | Access | Request Body | Response |
|---|---|---|---|---|---|
| POST | `/login` | Authenticate user | Public | `{username, password}` | `{token, role, fullName, expiresIn}` |
| POST | `/logout` | Invalidate session | All | — | `204 No Content` |
| POST | `/change-password` | Change own password | All | `{oldPassword, newPassword}` | `200 OK` |
| POST | `/forgot-password` | Admin resets user password | ADMIN | `{userId, newPassword}` | `200 OK` |

#### Patients (`/api/v1/patients`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/` | List all patients (paginated) | RECEPTIONIST, ADMIN |
| GET | `/{id}` | Get patient by ID | ALL |
| GET | `/search?q=` | Search patients by name/NIC/phone | ALL |
| POST | `/` | Create new patient | RECEPTIONIST, ADMIN |
| PUT | `/{id}` | Update patient | RECEPTIONIST, ADMIN |
| PATCH | `/{id}/status` | Change patient status | ADMIN |
| GET | `/{id}/history` | Get patient's full history (appointments, visits, bills) | ALL |

#### Appointments (`/api/v1/appointments`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/` | List all appointments (paginated, filterable) | RECEPTIONIST, ADMIN |
| GET | `/{id}` | Get appointment by ID | ALL |
| GET | `/today` | Get today's appointments | ALL |
| GET | `/upcoming` | Get future appointments | ALL |
| GET | `/search?q=` | Search appointments | ALL |
| POST | `/` | Create new appointment | RECEPTIONIST, ADMIN |
| PUT | `/{id}` | Reschedule appointment | RECEPTIONIST, ADMIN |
| PATCH | `/{id}/status` | Update appointment status | ALL |
| PATCH | `/{id}/cancel` | Cancel appointment (with reason) | RECEPTIONIST, ADMIN |

#### Dentists (`/api/v1/dentists`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/` | List all dentists | ALL |
| GET | `/{id}` | Get dentist profile | ALL |
| GET | `/{id}/availability?date=` | Get available time slots | ALL |
| GET | `/{id}/appointments` | Get dentist's appointments | ALL |
| POST | `/` | Create dentist | ADMIN |
| PUT | `/{id}` | Update dentist | ADMIN, DENTIST(own) |
| PUT | `/{id}/schedule` | Set working hours | ADMIN |

#### Treatments (`/api/v1/treatments`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/` | List all treatments (filterable) | ALL |
| GET | `/{id}` | Get treatment by ID | ALL |
| POST | `/` | Create treatment | ADMIN |
| PUT | `/{id}` | Update treatment | ADMIN |
| PATCH | `/{id}/status` | Activate/deactivate | ADMIN |

#### Visits (`/api/v1/visits`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/` | List all visits (paginated) | ALL |
| GET | `/{id}` | Get visit details with treatments | ALL |
| POST | `/` | Create visit from appointment | DENTIST, ADMIN |
| PUT | `/{id}` | Update visit (diagnosis, prescription, notes) | DENTIST, ADMIN |
| POST | `/{id}/treatments` | Add treatment to visit | DENTIST, ADMIN |
| DELETE | `/{id}/treatments/{vtId}` | Remove treatment from visit | DENTIST, ADMIN |
| PATCH | `/{id}/complete` | Mark visit as completed | DENTIST, ADMIN |

#### Bills (`/api/v1/bills`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/` | List all bills (paginated) | RECEPTIONIST, ADMIN |
| GET | `/{id}` | Get bill details | ALL |
| POST | `/` | Generate bill from visit | RECEPTIONIST, ADMIN |
| PATCH | `/{id}/discount` | Apply discount | RECEPTIONIST, ADMIN |
| PATCH | `/{id}/pay` | Record payment | RECEPTIONIST, ADMIN |
| GET | `/{id}/pdf` | Download PDF receipt | ALL |
| GET | `/patient/{patientId}` | Get billing history for patient | ALL |

#### Reports (`/api/v1/reports`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/daily-appointments?date=` | Daily appointments report | ADMIN |
| GET | `/monthly-revenue?month=&year=` | Monthly revenue report | ADMIN |
| GET | `/dentist-performance?from=&to=` | Dentist performance report | ADMIN, DENTIST(own) |
| GET | `/popular-treatments?from=&to=` | Popular treatments report | ADMIN |
| GET | `/patient-statistics` | Patient statistics report | ADMIN |
| GET | `/cancelled-appointments?from=&to=` | Cancelled appointments report | ADMIN |
| GET | `/revenue-dashboard` | Revenue dashboard data | ADMIN |

#### Search (`/api/v1/search`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/global?q=` | Search across all entities | ALL |
| GET | `/suggestions?q=` | Type-ahead suggestions | ALL |

#### Settings (`/api/v1/settings`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/` | Get all settings | ADMIN |
| GET | `/{key}` | Get setting by key | ADMIN |
| PUT | `/{key}` | Update setting | ADMIN |
| GET | `/clinic` | Get clinic details | ALL |

#### Users (`/api/v1/users`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/` | List all users | ADMIN |
| GET | `/{id}` | Get user profile | ADMIN, OWN |
| POST | `/` | Create user account | ADMIN |
| PUT | `/{id}` | Update user | ADMIN |
| PATCH | `/{id}/status` | Activate/deactivate user | ADMIN |

#### Audit Logs (`/api/v1/audit-logs`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/` | List audit logs (paginated, filterable) | ADMIN |
| GET | `/entity/{type}/{id}` | Get audit history for specific entity | ADMIN |

#### Notifications (`/api/v1/notifications`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/` | Get current user's notifications | ALL |
| GET | `/unread-count` | Get unread notification count | ALL |
| PATCH | `/{id}/read` | Mark notification as read | ALL |
| PATCH | `/read-all` | Mark all as read | ALL |

#### Dashboard (`/api/v1/dashboard`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/summary` | Get dashboard summary stats | ALL |
| GET | `/charts/revenue` | Revenue chart data (last 6 months) | ADMIN |
| GET | `/charts/appointments` | Appointment status distribution | ALL |
| GET | `/recent-activity` | Recent system activity | ALL |

### 2.3 API Summary

| Module | Endpoints | Methods |
|---|---|---|
| Authentication | 4 | 4 POST |
| Patients | 7 | 3 GET, 1 POST, 1 PUT, 1 PATCH, 1 GET(search) |
| Appointments | 9 | 5 GET, 1 POST, 1 PUT, 2 PATCH |
| Dentists | 7 | 4 GET, 1 POST, 2 PUT |
| Treatments | 5 | 2 GET, 1 POST, 1 PUT, 1 PATCH |
| Visits | 7 | 2 GET, 2 POST, 1 PUT, 1 DELETE, 1 PATCH |
| Bills | 7 | 3 GET, 1 POST, 2 PATCH, 1 GET(pdf) |
| Reports | 7 | 7 GET |
| Search | 2 | 2 GET |
| Settings | 4 | 3 GET, 1 PUT |
| Users | 5 | 2 GET, 1 POST, 1 PUT, 1 PATCH |
| Audit Logs | 2 | 2 GET |
| Notifications | 4 | 1 GET, 3 PATCH |
| Dashboard | 4 | 4 GET |
| **Total** | **74** | — |

---

## 3. Data Validation Rules

| Entity | Field | Validation Rule |
|---|---|---|
| Patient | fullName | Required, 2–100 characters |
| Patient | nic | Required, unique, Sri Lankan format (9 digits + V/X or 12 digits) |
| Patient | telephone | Required, Sri Lankan format |
| Patient | email | Optional, valid email format |
| Patient | dateOfBirth | Required, must be past date |
| Patient | gender | Required, enum: MALE/FEMALE/OTHER |
| Appointment | appointmentDate | Required, must be future date |
| Appointment | startTime | Required, within dentist working hours |
| Appointment | endTime | Required, ≥ startTime + 15 minutes |
| Bill | discountPercentage | 0–50% range |
| User | username | Required, 3–50 chars, unique |
| User | password | Required, min 8 chars, 1 upper, 1 lower, 1 digit, 1 special |
| Dentist | licenseNumber | Required, unique |
| Treatment | standardCharge | Required, > 0 |
| Treatment | estimatedDurationMinutes | Required, ≥ 15 |

---

> **PHASE 2: REQUIREMENTS ANALYSIS — COMPLETED**
