# UI/UX Design System & Layout Document — Sunrise Dental Clinic

**Document ID:** SDC-UXD-001  
**Version:** 1.0  
**Date:** 14 July 2026  
**Project:** Sunrise Dental Clinic Management System (SDCMS)  
**Author:** UI/UX Designer — Vareka Engineering Team  
**Status:** Awaiting Approval  

---

## 1. High-Fidelity UI Mockup

The visual design system of SDCMS features a premium dark theme. Below is the mockup of the core Dashboard Interface representing the primary reception/admin view:

![Sunrise Dental Dashboard Mockup](/home/dulsan002/Documents/vareka/assets/images/dashboard_ui_mockup.png)

---

## 2. Design System Tokens

SDCMS uses a structured token system mapping theme values to CSS variables.

### 2.1 Color Palette

| Token Name | Light Theme Value | Dark Theme Value | Usage |
|---|---|---|---|
| `--color-bg-primary` | `#F8FAFC` (Slate 50) | `#0B0F19` (Deep Blue-Black) | Main background |
| `--color-bg-secondary` | `#FFFFFF` | `#111827` (Rich Gray) | Sidebar, cards, containers |
| `--color-border` | `#E2E8F0` (Slate 200) | `#1F2937` (Gray 800) | Dividers, table borders |
| `--color-text-primary` | `#0F172A` (Slate 900) | `#F9FAFB` (Gray 50) | Titles, prominent text |
| `--color-text-secondary`| `#64748B` (Slate 500) | `#9CA3AF` (Gray 400) | Subtitles, labels, helpers |
| `--color-primary` | `#0D9488` (Teal 600) | `#14B8A6` (Teal 500) | Main brand accents, primary buttons |
| `--color-secondary` | `#4F46E5` (Indigo 600) | `#6366F1` (Indigo 500) | Accent actions, secondary charts |
| `--color-success` | `#16A34A` (Green 600) | `#10B981` (Emerald 500) | Completed badges, success notifications |
| `--color-warning` | `#D97706` (Amber 600) | `#F59E0B` (Amber 500) | Pending invoices, no-shows |
| `--color-danger` | `#DC2626` (Red 600) | `#EF4444` (Red 500) | Cancelled slots, validation errors |

### 2.2 Typography
- **Primary Font Family:** `Outfit`, sans-serif (Google Fonts) — modern geometric layout.
- **Secondary Font Family:** `Inter`, sans-serif — chosen for maximum legibility in lists and data tables.
- **Font Sizes:**
  - `h1` (Page Title): `1.875rem` (30px) | Weight: 700 (Bold)
  - `h2` (Card Title): `1.25rem` (20px) | Weight: 600 (Semi-Bold)
  - `body-large` (Main lists): `1rem` (16px) | Weight: 500 (Medium)
  - `body` (Standard text): `0.875rem` (14px) | Weight: 400 (Regular)
  - `caption` (Table headers, details): `0.75rem` (12px) | Weight: 500 (Medium)

### 2.3 Borders & Elevation
- **Card Border Radius:** `12px` (standard card container)
- **Input Border Radius:** `8px`
- **Button Border Radius:** `8px`
- **Shadows (Light Theme):**
  - Card Shadow: `0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)`
  - Dropdown/Menu: `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)`
- **Shadows (Dark Theme):**
  - Card Shadow: `0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3)`
  - Dropdown/Menu: `0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.4)`

---

## 3. UI Layout & Wireframe Architecture

### 3.1 Page Layout Blueprint

```
+----------------------------------------------------------------------------------+
|  [Logo] Sunrise Dental  |  [Search Patients/APTs...]  |  (🔔 3)  [User Avatar v]  |
+-------------------------+--------------------------------------------------------+
|  📊 Dashboard           |                                                        |
|  📅 Appointments        |  Dashboard                                             |
|  👤 Patients            |  +--------------------------------------------------+  |
|  🦷 Dentists            |  | Today's Appts | Monthly Rev  | Total Patients   |  |
|  💊 Treatments          |  | 12            | LKR 32,500   | 1,452            |  |
|  🩺 Patient Visits      |  +--------------------------------------------------+  |
|  💵 Billing             |  |                                | Today's Appts   |  |
|  📈 Reports             |  |  [Chart: Revenue Growth]       | 09:00 Sarah J.  |  |
|                         |  |                                | 09:45 Michael B.|  |
|  ⚙️ Settings            |  |                                | 10:30 Jessica D.|  |
|  ❓ Help Centre         |  +--------------------------------------------------+  |
+-------------------------+--------------------------------------------------------+
```

---

## 4. Key Component Specifications

### 4.1 Data Tables (`DataTable` Component)
All list tables (Patients, Appointments, Billing, Audit Logs) must implement the following structural controls:
- **Top Bar:** Integrated fuzzy search input, status quick-filters, and action buttons (Create New, Export PDF, Export Excel).
- **Header:** Clicking columns toggles sort direction (ASC ➡️ DESC ➡️ None).
- **Row:** Interactive hover effects (subtle color highlight). Clicking a row opens the profile detail view.
- **Footer:** Pagination controls mapping `[First Page]` `[Prev]` `[Current / Total Pages]` `[Next]` `[Last Page]`. Includes records-per-page dropdown selector.

### 4.2 Form Validation Feedback
- **Input Fields:** Trigger real-time, validation checks upon blur (losing focus).
- **Invalid State:** Borders turn to red (`--color-danger`), an inline helper message is displayed below the field, and the submit button is disabled.
- **Format Masks:** Enforces format restrictions on inputs (e.g. phone number only accepts digits and parses starting with 0 or +94).

---

## 5. Interaction Patterns & Micro-Animations

- **Hover States:** Links and buttons smoothly transition color properties over `150ms` using `cubic-bezier(0.4, 0, 0.2, 1)`.
- **Modals & Dialogs:** Drop in from the top of the viewport with a subtle scale up animation (duration `200ms`).
- **Loading states:** Buttons change to a loading spinner when asynchronously writing to the server to prevent duplicate click submissions.
- **Toast Alerts:** Action confirmations (e.g., "Patient Registered Successfully") slide in from the top-right corner, remaining visible for 3 seconds before sliding out.

---

> **PHASE 6: UI/UX DESIGN — COMPLETED**
