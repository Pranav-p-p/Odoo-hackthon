# End-to-End Workflows

This document defines the exact operational workflows for every screen in AssetFlow, aligned with the organizer's Excalidraw mockup (Screens 1–10) and the problem statement.

---

## 1. Login / Signup Workflow (Screen 1)

### Signup
1. User navigates to the Signup page.
2. User enters **Name**, **Email**, **Password**, and selects a **Department** from a dropdown.
3. Frontend calls `POST /auth/signup`.
4. Backend validates email uniqueness and password length (≥ 8 chars).
5. Backend creates a `User` record with `role: EMPLOYEE`, `status: ACTIVE`.
6. Backend hashes password with bcrypt, generates JWT, returns token + user object.
7. Frontend stores JWT and redirects to Dashboard (Screen 2).

> **Rule:** Signup creates an Employee only. No role selection at signup. Admin promotes roles later from Screen 3.

### Login
1. User enters **Email** and **Password**.
2. Frontend calls `POST /auth/login`.
3. Backend verifies credentials. Rejects if `status: INACTIVE`.
4. On success, returns JWT + user object. Frontend stores token, redirects to Dashboard.

### Forgot Password
1. User clicks "Forgot password?" link.
2. User enters email. Frontend calls `POST /auth/forgot-password`.
3. Backend sends a reset link (or for the hackathon demo, logs it to console).
4. User resets password via the link.

---

## 2. Dashboard / Home Workflow (Screen 2)

1. On page load, frontend calls `GET /dashboard/kpi` and `GET /dashboard/recent-activity`.
2. **KPI Cards** render with real-time aggregates:
   - **Assets Available** — `COUNT(Asset WHERE status = AVAILABLE)`
   - **Assets Allocated** — `COUNT(Asset WHERE status = ALLOCATED)`
   - **Maintenance Today** — `COUNT(MaintenanceRequest WHERE status IN (APPROVED, TECHNICIAN_ASSIGNED, IN_PROGRESS) AND updatedAt = today)`
   - **Upcoming Returns** — `COUNT(Allocation WHERE status = ACTIVE AND expectedReturn IS NOT NULL AND expectedReturn > now())`
   - **Pending Transfers** — `COUNT(Transfer WHERE status = REQUESTED)`
   - **Active Bookings** — `COUNT(Booking WHERE status IN (UPCOMING, ONGOING))`
3. **Overdue Returns** banner: `COUNT(Allocation WHERE status = ACTIVE AND expectedReturn < now())` — highlighted with warning text: *"3 assets overdue for return — flagged for follow-up"*.
4. **Quick Actions** bar:
   - "+ Register Asset" → navigates to Screen 4 (Asset Registration form)
   - "Book Resource" → navigates to Screen 6 (Resource Booking)
   - "Raise Request" → navigates to Screen 7 (Maintenance — raise form)
5. **Recent Activity** panel: Displays latest entries from `GET /dashboard/recent-activity`.

---

## 3. Organization Setup Workflow (Screen 3 — Admin Only)

### Tab A — Department Management
1. Admin views a table of all departments: **Department Name**, **Head**, **Parent Dept**, **Status**.
2. **Create:** Admin clicks "+ Add", enters department name, optionally assigns a Head (from User dropdown) and Parent Department. Calls `POST /departments`.
3. **Edit:** Admin clicks a row, modifies name/head/parent. Calls `PATCH /departments/:id`.
4. **Deactivate:** Admin toggles status to `INACTIVE`. Calls `PATCH /departments/:id` with `{ "status": "INACTIVE" }`. Inactive departments are hidden from allocation/booking dropdowns on Screens 4, 5, 6.

> **Dependency:** Editing departments here updates the picklists on Screen 4 (Asset Registration) and Screen 5 (Allocation).

### Tab B — Asset Category Management
1. Admin views a list of categories.
2. **Create:** Clicks "+ Add", enters name and optional description. Calls `POST /categories`.
3. **Edit:** Calls `PATCH /categories/:id`.

### Tab C — Employee Directory
1. Admin views a table: **Name**, **Email**, **Department**, **Role**, **Status**.
2. **Promote:** Admin selects an `EMPLOYEE` and promotes them to `DEPARTMENT_HEAD` or `ASSET_MANAGER`. Calls `PATCH /users/:id/role`.
3. **Deactivate:** Admin toggles a user to `INACTIVE`. Calls `PATCH /users/:id/status`. Inactive users cannot log in.

> **Rule:** This is the **only** place roles are assigned. No self-elevation.

---

## 4. Asset Registration & Directory Workflow (Screen 4)

### Registration
1. `ASSET_MANAGER` clicks "+ Register Asset".
2. Fills form: **Name**, **Category** (dropdown from Screen 3 categories), auto-generated **Asset Tag** (e.g., AF-0001), **Serial Number**, **Acquisition Date**, **Acquisition Cost**, **Condition**, **Location**, **Photo**, **Shared/Bookable** toggle.
3. Calls `POST /assets`. Asset enters system with `status: AVAILABLE`.

### Directory
1. Users view the asset table: **Tag**, **Name**, **Category**, **Status**, **Location**.
2. **Search:** by asset tag, serial number, or name using the search bar.
3. **Filter:** dropdowns for Category, Status, Department, Location.
4. **Asset Detail:** Clicking a row opens detail view showing:
   - Full asset information
   - Allocation history (from `Allocation` table)
   - Maintenance history (from `MaintenanceRequest` table)

---

## 5. Asset Allocation & Transfer Workflow (Screen 5)

### Allocation (Happy Path)
1. `ASSET_MANAGER` selects an asset with `status: AVAILABLE`.
2. Selects an employee to allocate to, optionally sets **Expected Return Date**.
3. Calls `POST /allocations`.
4. Backend sets asset `status → ALLOCATED`, creates Allocation record with `status: ACTIVE`.
5. System creates an `ASSET_ASSIGNED` notification for the employee.

### Double-Allocation Block (Conflict Path)
1. `ASSET_MANAGER` selects an asset with `status: ALLOCATED`.
2. Backend returns `409 Conflict` with: `{ "currentHolder": { "name": "Priya Shah", "department": "Engineering" }, "suggestTransfer": true }`.
3. Frontend displays: *"Already Allocated to Priya Shah (Engineering). Direct re-allocation is blocked — submit a transfer request below."*
4. A **Transfer Request** form appears inline.

### Transfer
1. User fills: **To** (employee/department dropdown), **Reason**.
2. Calls `POST /transfers`. Backend auto-populates `fromUserId`/`fromDeptId` from current allocation.
3. `ASSET_MANAGER` or `ADMIN` reviews pending transfers.
4. **Approve:** `PATCH /transfers/:id/approve` → old allocation closed, new allocation created, asset `departmentId` updated, history logged.
5. **Reject:** `PATCH /transfers/:id/reject` → transfer marked `REJECTED`, notification sent.

### Return
1. `ASSET_MANAGER` clicks "Mark Returned" on an active allocation.
2. Enters **Return Condition** (Good/Fair/Damaged) and **Notes**.
3. Calls `PATCH /allocations/:id/return`.
4. Asset `status → AVAILABLE`. Allocation `status → RETURNED`.

### Overdue Tracking
- A scheduled check (or on-dashboard-load) identifies allocations where `expectedReturn < now()` and `status = ACTIVE`.
- These are auto-flagged as `OVERDUE` and generate `OVERDUE_RETURN_ALERT` notifications to the employee and their department head.

---

## 6. Resource Booking Workflow (Screen 6)

1. Employee navigates to Screen 6 and selects a resource (asset with `isBookable: true`).
2. A **calendar/timeline view** shows existing bookings for that resource on the selected date.
3. Employee picks a time slot: **Start Time**, **End Time**, optional **Purpose**.
4. Frontend calls `POST /bookings`.
5. **Overlap Validation:** Backend queries:
   ```sql
   SELECT * FROM Booking
   WHERE assetId = :assetId
     AND status != 'CANCELLED'
     AND startTime < :endTime
     AND endTime > :startTime
   ```
   - If overlap found → `409 Conflict` with details of the conflicting booking.
   - Frontend displays: *"Requested 9:30 to 10:30 — conflict — slot is unavailable"* with the existing booking shown (e.g., *"Booked — Procurement Team — 9 to 10"*).
6. If no overlap → booking saved as `UPCOMING`. `BOOKING_CONFIRMED` notification sent.
7. **Status transitions:**
   - `UPCOMING → ONGOING`: When current time enters the booking window.
   - `ONGOING → COMPLETED`: When current time passes the end time.
   - User can cancel → `CANCELLED`.

---

## 7. Maintenance Management Workflow (Screen 7 — Kanban Board)

The maintenance workflow is displayed as a **Kanban board** with 5 columns:

```
| Pending | Approved | Technician Assigned | In Progress | Resolved |
```

### Raise Request
1. Any user selects an asset, describes the issue, sets **Priority** (Low/Medium/High/Critical), optionally attaches a **photo**.
2. Calls `POST /maintenance-requests`. Card appears in **Pending** column.

### Approval
3. `ASSET_MANAGER` reviews the request.
4. **Approve:** `PATCH /maintenance-requests/:id/approve`
   - Status → `APPROVED`. Card moves to **Approved** column.
   - **Auto-status update:** Asset status → `UNDER_MAINTENANCE`.
   - `MAINTENANCE_APPROVED` notification sent to requester.
5. **Reject:** `PATCH /maintenance-requests/:id/reject`
   - Status → `REJECTED`. Card removed from board. Notification sent.

### Technician Assignment
6. `ASSET_MANAGER` assigns a technician: `PATCH /maintenance-requests/:id/assign` with `{ "technicianId": "uuid" }`.
7. Status → `TECHNICIAN_ASSIGNED`. Card moves to **Technician Assigned** column.

### Work Execution
8. Technician (or manager) starts work: `PATCH /maintenance-requests/:id/start`.
9. Status → `IN_PROGRESS`. Card moves to **In Progress** column.

### Resolution
10. Technician completes work: `PATCH /maintenance-requests/:id/resolve` with `{ "resolvedNotes": "..." }`.
11. Status → `RESOLVED`. Card moves to **Resolved** column.
12. **Auto-status update:** Asset status → `AVAILABLE` (reverts from `UNDER_MAINTENANCE`).

> **Rule:** Approving moves asset to UNDER_MAINTENANCE. Resolving returns it to AVAILABLE.

---

## 8. Asset Audit Workflow (Screen 8)

### Initiation
1. `ADMIN` or `ASSET_MANAGER` creates an Audit Cycle: **Name** (e.g., "Q3 Audit: Engineering Dept"), **Department** scope, **Location** scope, **Auditor(s)**, **Start Date**, **End Date**.
2. Calls `POST /audits`. System auto-generates `AuditItem` records for every asset in the scoped department/location.

### Execution (Checklist)
3. Assigned auditor opens the audit cycle. Sees a checklist table:
   - **Asset** (tag + name)
   - **Expected Location** (from asset record)
   - **Verification** (dropdown: Verified / Missing / Damaged)
4. Auditor physically verifies each asset and updates: `PATCH /audits/:id/items/:itemId` with `{ "actualStatus": "VERIFIED|MISSING|DAMAGED", "notes": "..." }`.
5. Cycle status transitions: `OPEN → IN_PROGRESS` when first item is verified.

### Discrepancy Report
6. At any time, `GET /audits/:id/discrepancy-report` returns only items flagged as `MISSING` or `DAMAGED`.
7. System displays: *"2 assets flagged — discrepancy report generated automatically"*.

### Close Cycle
8. Admin clicks "Close Audit Cycle": `PATCH /audits/:id/close`.
9. **Side effects:**
   - Cycle status → `CLOSED`. `closedAt` timestamp set.
   - Assets confirmed `MISSING` → status updated to `LOST`.
   - `AUDIT_DISCREPANCY_FLAGGED` notification sent to Admin for each flagged item.
   - Cycle is locked — no further edits allowed.

---

## 9. Reports & Analytics Workflow (Screen 9)

1. Manager navigates to Reports screen. Views pre-built analytics panels:

| Panel | Data Source | Visualization |
|-------|------------|---------------|
| Utilization by Department | `GET /reports/utilization` | Bar chart |
| Maintenance Frequency | `GET /reports/maintenance-frequency` | Bar/line chart |
| Most Used Assets | `GET /reports/most-used` | Ranked list |
| Idle Assets | `GET /reports/idle-assets` | Table (asset, days idle) |
| Due for Maintenance / Nearing Retirement | `GET /reports/due-for-maintenance` | Alert list |
| Booking Heatmap | `GET /reports/booking-heatmap` | Heatmap grid |
| Department Allocation Summary | `GET /reports/department-allocation` | Pie/bar chart |

2. **Export:** User clicks "Export Report" → `GET /reports/export?type=...` → CSV download.

---

## 10. Activity Logs & Notifications Workflow (Screen 10)

### Notifications
1. User opens the notification panel (bell icon in top nav or full screen).
2. Frontend calls `GET /notifications?category=ALL`.
3. **Tab filters:** All | Alerts | Approvals | Bookings — maps to `category` query param.
4. Each notification shows: **message**, **timestamp** (relative: "2m ago", "1h ago").
5. Clicking a notification marks it read: `PATCH /notifications/:id/read`.
6. "Mark all read" button: `PATCH /notifications/read-all`.

### Notification examples (from Excalidraw Screen 10):
- *"Laptop AF-0014 assigned to Priya Shah"* — 2m ago — `ALERTS`
- *"Maintenance request AF-0055 approved"* — 18m ago — `APPROVALS`
- *"Booking confirmed: Room B2: 2:00 to 3:00 PM"* — 1h ago — `BOOKINGS`
- *"Transfer approved: AF-0033 to Facilities Dept"* — 3h ago — `APPROVALS`
- *"Overdue return: AF-0021 was due 3 days ago"* — 1d ago — `ALERTS`
- *"Audit discrepancy flagged: AF-0088 damaged"* — 2d ago — `ALERTS`

### Activity Logs
- Every POST, PATCH, DELETE action across the system creates an `ActivityLog` entry.
- Frontend calls `GET /activity-logs?page=1&limit=20` for a chronological timeline.
- Per-asset history: `GET /activity-logs?entityType=Asset&entityId=...` shown on the asset detail page (Screen 4).

---

## 11. Global Background Workflows

### Overdue Detection
- On dashboard load (or via scheduled job), query allocations where `expectedReturn < now()` and `status = ACTIVE`.
- Mark as `OVERDUE`. Generate `OVERDUE_RETURN_ALERT` notifications.

### Booking Status Transitions
- On page load or via scheduled job:
  - `UPCOMING → ONGOING` when `startTime ≤ now() < endTime`.
  - `ONGOING → COMPLETED` when `now() ≥ endTime`.
- `BOOKING_REMINDER` notification sent 15 minutes before `startTime`.

### Activity Logging
- All controllers call a shared `createLog(userId, action, entityType, entityId, details)` utility after every write operation.
