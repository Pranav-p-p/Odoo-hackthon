# Acceptance Criteria (Hackathon Scope)

This document defines what constitutes a "finished" project for the demo. It is structured around the 10 screens from the Excalidraw mockup and strictly separates Must-Haves from Nice-to-Haves. If time is running out, prioritize the Must-Haves.

---

## 🟢 Must-Have (Minimum Viable Demo — Screens 1–7)

These 7 screens form the core demo flow. All must be functional for a working submission.

### Screen 1 — Login / Signup
- [ ] Users can sign up with name, email, password, department. Account is created as `EMPLOYEE`.
- [ ] Users can log in with email and password. JWT is returned and stored.
- [ ] Inactive users are rejected on login.

### Screen 2 — Dashboard
- [ ] Dashboard displays **6 KPI cards** with accurate aggregate counts: Assets Available, Assets Allocated, Maintenance Today, Upcoming Returns, Pending Transfers, Active Bookings.
- [ ] **Overdue returns** banner is visible when allocations are past expected return date.
- [ ] **Quick actions** (Register Asset, Book Resource, Raise Request) navigate to the correct screens.
- [ ] **Recent Activity** panel shows latest log entries.

### Screen 3 — Organization Setup (Admin Only)
- [ ] Admin can create, edit, and deactivate a **Department** (with Head and Parent Department fields).
- [ ] Admin can create and edit an **Asset Category**.
- [ ] Admin can view the **Employee Directory** and promote an Employee to `DEPARTMENT_HEAD` or `ASSET_MANAGER`.
- [ ] Admin can deactivate a user (set status to `INACTIVE`).

### Screen 4 — Asset Registration & Directory
- [ ] Asset Manager can **register a new asset** with: name, category, asset tag (auto-generated AF-XXXX), serial number, location, condition, bookable flag.
- [ ] Asset Directory displays a searchable, filterable table (filter by status, category, department, location).
- [ ] Clicking an asset shows its **detail page** with allocation and maintenance history.

### Screen 5 — Allocation & Transfer
- [ ] Asset Manager can **allocate an AVAILABLE asset** to an employee. Asset status → `ALLOCATED`.
- [ ] System **blocks double-allocation**: shows "Already Allocated to [Name] ([Dept])" with a Transfer Request option.
- [ ] Asset Manager can **mark an asset as returned** with condition and notes. Asset status → `AVAILABLE`.
- [ ] Transfer Request can be submitted and approved/rejected by Asset Manager or Admin.

### Screen 6 — Resource Booking
- [ ] Employee can **book a shared resource** (`isBookable: true`) by selecting a time slot.
- [ ] Backend **rejects overlapping bookings** with a 409 error and conflict details.
- [ ] Calendar/timeline view shows existing bookings for the selected resource.

### Screen 7 — Maintenance Management
- [ ] Any user can **raise a maintenance request** with issue description and priority.
- [ ] Asset Manager can **approve** → asset status auto-changes to `UNDER_MAINTENANCE`.
- [ ] Asset Manager can **assign a technician** and **start** the work.
- [ ] Resolving the request auto-changes asset status back to `AVAILABLE`.
- [ ] Maintenance requests are displayed as a **Kanban board** (Pending → Approved → Technician Assigned → In Progress → Resolved).

---

## 🟡 Nice-to-Have (Do these only if MVP screens 1–7 are done)

### Screen 8 — Audit
- [ ] Admin/Asset Manager can create an **Audit Cycle** with department/location scope, auditor, and date range.
- [ ] Auditor can mark each asset as **Verified / Missing / Damaged**.
- [ ] System auto-generates a **discrepancy report** for flagged items.
- [ ] Closing the audit cycle updates affected asset statuses (e.g., Missing → `LOST`).

### Screen 9 — Reports & Analytics
- [ ] **Utilization by department** chart.
- [ ] **Maintenance frequency** chart.
- [ ] **Most used assets** and **Idle assets** lists.
- [ ] **Assets due for maintenance / nearing retirement** alert list.
- [ ] **Export Report** button downloads CSV.

### Screen 10 — Activity Logs & Notifications
- [ ] In-app notification list with **tab filtering** (All | Alerts | Approvals | Bookings).
- [ ] Unread notification count badge in the top nav bar.
- [ ] Full activity log with chronological timeline of who did what, when.
- [ ] Mark individual notifications as read / mark all as read.

---

## 🔴 Out of Scope (Do NOT Build)

- Invoicing and purchasing workflows.
- Depreciation calculations or financial accounting.
- Payroll integration.
- Hardware integrations (actual barcode/RFID scanning — mock it with manual entry or a simple button click for the demo).
- Mobile apps (responsive web UI is sufficient).
- Email sending (log to console for the demo).
- File upload to cloud storage (use URL strings or local placeholders).

---

## Demo Script Strategy

Walk through the system exactly as the Excalidraw screens are ordered:

### Act 1: Setup (Screens 1 + 3)
1. **Sign up** as an employee (show the "Employee only" note).
2. **Login as Admin** (pre-seeded). Show the clean Dashboard (Screen 2).
3. **Organization Setup** (Screen 3):
   - Create a department (e.g., "Engineering") with a head.
   - Create an asset category (e.g., "Electronics").
   - Promote the signed-up employee to `ASSET_MANAGER`.

### Act 2: Asset Operations (Screens 4 + 5)
4. **Login as the new Asset Manager.**
5. **Register a high-value asset** (Screen 4) — e.g., "Dell Laptop" with tag AF-0012, category Electronics, location "Bengaluru".
6. **Register a bookable resource** — e.g., "Conference Room B2" with `isBookable: true`.
7. **Allocate the laptop** to an employee (Screen 5). Show the asset status change to `ALLOCATED`.
8. **Try to allocate the same laptop** to another employee — show the **double-allocation block** message and the transfer request option.

### Act 3: Bookings & Maintenance (Screens 6 + 7)
9. **Login as Employee.**
10. **Book the conference room** (Screen 6) for 9:00–10:00. Show the calendar view.
11. **Try to double-book** the same room for 9:30–10:30 — show the **overlap rejection** with conflict display.
12. **Raise a maintenance request** (Screen 7) for the laptop — priority: HIGH.
13. **Login as Asset Manager.** Approve the maintenance request — show the asset status automatically change to `UNDER_MAINTENANCE`.
14. **Assign a technician**, start the work, then **resolve** it — show the asset status revert to `AVAILABLE`.

### Act 4: Intelligence (Screens 2 + 8–10) — if time permits
15. **Show the Dashboard** (Screen 2) — KPI cards now reflect the operations performed.
16. **Create an Audit Cycle** (Screen 8) — verify assets, show the discrepancy report.
17. **Show Reports** (Screen 9) — utilization chart, maintenance frequency.
18. **Show Notifications** (Screen 10) — all the notifications generated throughout the demo, filterable by tab.

---

## What Counts as a Working Submission

| Criterion | Required? |
|-----------|-----------|
| User can sign up, log in, and see role-based content | ✅ Yes |
| Admin can set up departments, categories, and promote roles | ✅ Yes |
| Asset Manager can register and allocate assets | ✅ Yes |
| Double-allocation is visually blocked with transfer redirect | ✅ Yes |
| Booking overlap is rejected with conflict info | ✅ Yes |
| Maintenance approval auto-updates asset status | ✅ Yes |
| Dashboard shows accurate KPIs | ✅ Yes |
| Audit, Reports, and Notifications are functional | 🟡 Nice-to-have |
| All data persists across page refreshes | ✅ Yes |
| App is responsive (works on desktop and tablet) | ✅ Yes |
