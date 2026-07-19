# User Manual — Sunrise Dental Clinic Management System

**Document ID:** SDC-USR-001 | **Version:** 1.0 | **Date:** 14 July 2026  
**Audience:** Receptionists, Dentists, Administrators

---

## 1. Getting Started

### 1.1 Accessing the System
1. Open your web browser (Chrome, Firefox, or Edge recommended).
2. Navigate to: `http://localhost:5173` (development) or `https://sdcms.sunrisedental.com` (production).
3. You will see the **Sunrise Dental Login Page**.

### 1.2 Logging In
1. Enter your **Username** and **Password** provided by the administrator.
2. Click **Sign In**.
3. On success, you are redirected to your role-specific **Dashboard**.

> ⚠️ **Account Lockout:** After 5 consecutive failed login attempts, your account will be locked. Contact the administrator to unlock it.

### 1.3 Changing Your Password
1. Click your **profile avatar** in the sidebar footer.
2. Select **Change Password**.
3. Enter your current password, then your new password (must include: 8+ characters, 1 uppercase, 1 lowercase, 1 digit, 1 special character).
4. Click **Save**.

### 1.4 Logging Out
Click the **Logout** button at the bottom of the sidebar. Your session token is immediately invalidated.

---

## 2. Dashboard

Upon login, you see your role-specific dashboard:

| Role | Dashboard Content |
|---|---|
| **Administrator** | Today's appointments count, monthly revenue, total patients, pending bills, revenue chart, appointment distribution chart |
| **Receptionist** | Today's appointments, upcoming appointments, recent patient registrations |
| **Dentist** | Today's schedule, pending visits, recent visit history |

---

## 3. Patient Management

### 3.1 Registering a New Patient
1. Navigate to **Patients** in the sidebar.
2. Click **+ New Patient**.
3. Fill in all required fields:
   - Full Name, NIC (Sri Lankan format), Gender, Date of Birth
   - Address, Telephone (+94XXXXXXXXX or 0XXXXXXXXX), Email (optional)
   - Emergency Contact Name and Phone
   - Blood Group (optional), Medical Notes (optional)
4. Click **Save Patient**.
5. A unique **Patient Code** (e.g., `PAT-2026-00001`) is auto-generated.

### 3.2 Searching for a Patient
- Use the **search bar** at the top of the Patients list.
- Search by: Name, NIC, Telephone, or Patient Code.
- Results update in real-time as you type.

### 3.3 Viewing Patient Profile
- Click any patient row to open their **detail view**.
- The profile shows: personal information, appointment history, visit records, and billing history.

### 3.4 Updating Patient Information
1. Open the patient profile.
2. Click **Edit**.
3. Modify the desired fields (Patient Code cannot be changed).
4. Click **Save Changes**.

### 3.5 Deactivating a Patient
1. Open the patient profile.
2. Click **Change Status** → **Inactive**.
3. Inactive patients cannot have new appointments scheduled.

---

## 4. Appointment Management

### 4.1 Scheduling a New Appointment
1. Navigate to **Appointments** → **+ New Appointment**.
2. Select a **Patient** (search by name or NIC).
3. Select a **Dentist**.
4. Choose a **Date** (must be today or future).
5. The system displays **available time slots** based on the dentist's schedule and existing bookings.
6. Select a time slot (minimum 15 minutes).
7. Add optional **Notes**.
8. Click **Schedule Appointment**.
9. An **Appointment Number** (e.g., `APT-2026-00001`) is auto-generated.

### 4.2 Viewing Today's Appointments
- Navigate to **Appointments** → **Today** tab.
- See all appointments for today sorted by time.

### 4.3 Rescheduling an Appointment
1. Click on the appointment.
2. Click **Reschedule**.
3. Select a new date and available time slot.
4. Click **Confirm Reschedule**.

### 4.4 Cancelling an Appointment
1. Click on the appointment.
2. Click **Cancel Appointment**.
3. Enter a **mandatory cancellation reason**.
4. Confirm. The status changes to **CANCELLED**.
5. ⚠️ Cancelled appointments **cannot be reinstated**. A new appointment must be created.

### 4.5 Appointment Status Lifecycle
`SCHEDULED` → `CONFIRMED` → `IN_PROGRESS` → `COMPLETED`  
At any point before completion: → `CANCELLED` or `NO_SHOW`

---

## 5. Dentist Management (Admin Only)

### 5.1 Adding a New Dentist
1. Navigate to **Dentists** → **+ Add Dentist**.
2. Enter: Full Name, Specialization, Qualifications, License Number, Contact Details, Consultation Fee.
3. Optionally link to a **user account** with DENTIST role.
4. Click **Save**.

### 5.2 Configuring Working Hours
1. Open the dentist profile → **Schedule** tab.
2. For each day of the week, set: Start Time, End Time, and Available toggle.
3. Click **Save Schedule**.

---

## 6. Treatment Catalogue (Admin Only)

### 6.1 Adding a New Treatment
1. Navigate to **Treatments** → **+ Add Treatment**.
2. Enter: Treatment Name, Type (Preventive/Restorative/Cosmetic/Surgical/Orthodontic), Description, Duration (min 15 mins), Standard Charge (LKR).
3. Click **Save**.

### 6.2 Deactivating a Treatment
- Toggle the **Active/Inactive** switch. Inactive treatments cannot be added to visits.

---

## 7. Patient Visits (Dentist Role)

### 7.1 Starting a Visit
1. From **Today's Appointments**, click **Start Visit** on a confirmed appointment.
2. The appointment status changes to **IN_PROGRESS**.
3. A new visit record is created with a **Visit Number** (e.g., `VIS-2026-00001`).

### 7.2 Recording Visit Details
1. Enter **Diagnosis**, **Prescription**, and **Dentist Notes**.
2. Click **Add Treatment** to record each treatment performed:
   - Select treatment from catalogue
   - Set quantity and actual charge (defaults to standard charge)
3. Set **Follow-up Date** if needed.
4. Click **Complete Visit**.
5. The appointment status changes to **COMPLETED** and the receptionist is notified for billing.

---

## 8. Billing

### 8.1 Generating a Bill
1. Navigate to **Billing** → **Generate Bill**.
2. Select a **completed visit** that doesn't yet have a bill.
3. The system auto-calculates:
   - **Consultation Fee** (from dentist profile)
   - **Treatment Total** (sum of charge × quantity for all treatments)
   - **Sub-total** = Consultation Fee + Treatment Total
4. Apply **Discount** (0–50% range).
5. **Tax** is applied based on system settings (default 0%).
6. **Final Total** = Sub-total − Discount + Tax.
7. Click **Generate Bill**. A **Bill Number** (e.g., `INV-2026-00001`) is auto-generated.

### 8.2 Recording Payment
1. Open the bill.
2. Click **Record Payment**.
3. Select **Payment Method**: Cash, Card, or Bank Transfer.
4. Click **Confirm Payment**.
5. Status changes to **PAID**. ⚠️ Paid bills cannot be modified.

### 8.3 Printing / Downloading Receipt
- Click **Download PDF** or **Print** on any bill to generate a formatted receipt.

---

## 9. Reports (Admin Only)

| Report | Description | Filters |
|---|---|---|
| Daily Appointments | All appointments for a specific date | Date picker |
| Monthly Revenue | Revenue breakdown by month | Month/Year |
| Dentist Performance | Appointments, completions, revenue per dentist | Date range |
| Popular Treatments | Treatment frequency ranking | Date range |
| Patient Statistics | Registration trends, demographics | — |
| Cancelled Appointments | Cancellation analysis with reasons | Date range |

All reports can be **exported to PDF** or **Excel**.

---

## 10. Search

- Click the **Search** icon in the sidebar for **Global Search**.
- Search across: Patients, Appointments, Dentists, Treatments, Bills.
- Results are grouped by entity type with quick-access links.

---

## 11. Help Centre

Navigate to **Help Centre** in the sidebar for:
- Step-by-step module guides
- FAQ section
- Keyboard shortcuts reference

---

> **END OF USER MANUAL**
