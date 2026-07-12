# Role Distribution & Team Work Split

To ensure zero merge conflicts and parallel development, the 4-person team is assigned highly isolated vertical slices (Full-stack: DB + Express + React). Each member owns specific screens from the Excalidraw mockup.

---

## Member 1: Identity & Foundation
**Screens:** Screen 1 (Login/Signup) + Screen 3 (Organization Setup)
**Focus:** Authentication, Organization structure, and Role Management.

*   **Backend:**
    *   Auth endpoints (`/auth/login`, `/auth/signup`, `/auth/forgot-password`, `/auth/me`).
    *   JWT generation and validation middleware (`auth.middleware.js`).
    *   Role authorization middleware (`role.middleware.js`).
    *   Department CRUD with hierarchy (`headId`, `parentDepartmentId`, `status`).
    *   Asset Category CRUD.
    *   Employee Directory — list users, role promotion (`/users/:id/role`), status toggle (`/users/:id/status`).
*   **Frontend:**
    *   Login & Signup screens (Screen 1) — email/password form, "Forgot password?" link, "New here? Create Account" link.
    *   Organization Setup view (Screen 3) — 3 tabs: Departments (table with Head, Parent Dept, Status), Categories, Employee Directory (with promote and deactivate actions).
    *   Global `AuthContext` for `currentUser` — provides `user`, `login()`, `logout()` to the whole app.
    *   `DashboardLayout.jsx` — Sidebar navigation + content area shell.
    *   Protected route wrapper (redirects unauthenticated users to login).
*   **Handoff Point:** Once JWT middleware and `req.user` are working (target: **Hour 2**), inform the entire team so they can protect their routes. Also provide `DashboardLayout` so other members can build their pages inside the sidebar shell.

---

## Member 2: Asset Core
**Screens:** Screen 4 (Asset Registration & Directory) + Screen 5 (Allocation & Transfer)
**Focus:** Asset directory, Lifecycle management, Allocations, Transfers, and double-allocation prevention.

*   **Backend:**
    *   Asset CRUD (`/assets`) with search and filter support (by tag, serial, name, category, status, department, location).
    *   Asset Tag auto-generation (`AF-XXXX`).
    *   Allocation endpoints (`/allocations`) — create, return (with `returnCondition` + `returnNotes`).
    *   Double-allocation check: returns `409` with `currentHolder` info and `suggestTransfer: true`.
    *   Transfer endpoints (`/transfers`) — create, approve, reject.
    *   Transfer approval logic: close old allocation, create new allocation, update asset `departmentId`.
    *   Overdue allocation detection (query allocations past `expectedReturn`).
*   **Frontend:**
    *   Asset Registration Form (Screen 4) — form with category dropdown, location, photo upload, bookable toggle.
    *   Asset Directory (Screen 4) — data table with search bar and filter dropdowns (Category, Status, Department, Location).
    *   Asset Detail page — full info + allocation history + maintenance history tabs.
    *   Allocation & Transfer page (Screen 5) — allocation form with conflict display ("Already Allocated to X — submit transfer request below"), inline transfer request form, allocation history timeline.
*   **Handoff Point:** Ensure the `Asset` and `Allocation` tables are finalized early (target: **Hour 1.5**) so Members 3 and 4 can reference `assetId`. Provide a `/assets` GET endpoint quickly so Member 3 can populate asset dropdowns for booking/maintenance.

---

## Member 3: Operations
**Screens:** Screen 6 (Resource Booking) + Screen 7 (Maintenance Management)
**Focus:** Resource booking with overlap validation and Kanban maintenance workflow.

*   **Backend:**
    *   Booking endpoints (`/bookings`) — create with overlap validation, cancel.
    *   Overlap check SQL query: finds conflicting non-CANCELLED bookings for the same asset and overlapping time.
    *   Returns `409` with `conflictingBooking` details on overlap.
    *   Maintenance request endpoints — create, approve, reject, assign technician, start, resolve.
    *   Auto-status updates: asset → `UNDER_MAINTENANCE` on approval, → `AVAILABLE` on resolution.
    *   Booking status transitions: `UPCOMING → ONGOING → COMPLETED` (based on current time).
*   **Frontend:**
    *   Resource Booking page (Screen 6) — resource selector, calendar/timeline view showing existing bookings, booking slot form, visual conflict display (*"Requested 9:30 to 10:30 — conflict — slot is unavailable"*).
    *   Maintenance Management page (Screen 7) — **Kanban board** with 5 columns: Pending | Approved | Technician Assigned | In Progress | Resolved. Each card shows asset tag, issue description, and technician name. Drag-and-drop or button actions to move cards.
*   **Handoff Point:** Rely on Member 2's Asset list endpoint for "Select Asset" dropdowns in booking and maintenance forms. Rely on Member 1's Auth middleware for protected routes.

---

## Member 4: Intelligence
**Screens:** Screen 2 (Dashboard) + Screen 8 (Audit) + Screen 9 (Reports) + Screen 10 (Notifications & Logs)
**Focus:** Audits, KPIs, Reports, Activity Logs, and Notifications.

*   **Backend:**
    *   Dashboard KPI endpoint (`/dashboard/kpi`) — aggregate queries across Asset, Allocation, Booking, Transfer, MaintenanceRequest tables.
    *   Dashboard recent activity (`/dashboard/recent-activity`).
    *   Audit Cycle CRUD — create cycle, auto-generate items, verify items, generate discrepancy report, close cycle with status updates.
    *   Reports endpoints — utilization, maintenance frequency, idle assets, most-used, due-for-maintenance, department allocation, booking heatmap, CSV export.
    *   Notification endpoints — list (with category filter), unread count, mark read, mark all read.
    *   Activity Log endpoint — paginated, filterable by entity type/id.
    *   **Shared utilities:** `createLog(userId, action, entityType, entityId, details)` and `createNotification(userId, title, message, type, category)` — exported for Members 1, 2, and 3 to call in their controllers.
*   **Frontend:**
    *   Dashboard (Screen 2) — KPI cards grid (Available, Allocated, Maintenance Today, Upcoming Returns, Pending Transfers, Active Bookings), overdue alert banner, quick action buttons, recent activity panel.
    *   Audit page (Screen 8) — audit cycle list, create cycle form, checklist table (Asset, Expected Location, Verification dropdown), discrepancy report view, "Close Audit Cycle" button.
    *   Reports page (Screen 9) — analytics panels with charts (utilization, maintenance frequency, most-used, idle, due-for-maintenance, booking heatmap), "Export Report" button.
    *   Notifications page (Screen 10) — tabbed view (All | Alerts | Approvals | Bookings), notification list with relative timestamps, mark-read actions. Also: `NotificationBell` component in the top nav bar showing unread count.
    *   Activity Log section — chronological timeline of actions.
*   **Handoff Point:** Provide `createLog()` and `createNotification()` utility functions early (target: **Hour 2**) so Members 1, 2, and 3 can call them inside their controllers.

---

## Integration Checkpoints

| Checkpoint | Hour | What Happens |
|---|---|---|
| **Schema Freeze** | 0.5 | Prisma schema finalized and migrated by Member 1. Everyone pulls and runs `npx prisma generate`. |
| **Auth Ready** | 2.0 | Member 1 finishes Auth + JWT middleware. All members integrate `auth.middleware.js` on their routes. Member 4 delivers `createLog()` + `createNotification()` utilities. |
| **Core APIs** | 4.0 | Members 1–3 have their backend endpoints working. Member 4 has Dashboard KPI and Notification endpoints ready. |
| **UI Integration** | 5.5 | Frontend pages wired to live APIs (replacing mock data). Cross-module testing begins. |
| **Feature Complete** | 7.0 | All 10 screens functional. Bug fixes only after this point. |
| **Demo Ready** | 7.5 | Final build, cross-module smoke test, demo script rehearsal. |

---

## What Each Member Must NOT Touch

| Member | Do NOT modify |
|--------|--------------|
| Member 1 | Asset routes, booking routes, maintenance routes, audit routes, report routes |
| Member 2 | Auth routes, department/category/user routes, booking routes, maintenance routes, audit/report routes |
| Member 3 | Auth routes, department/category/user routes, asset/allocation/transfer routes, audit/report routes |
| Member 4 | Auth routes, department/category/user routes, asset/allocation/transfer routes, booking/maintenance routes |

> **Exception:** All members may (and should) call `createLog()` and `createNotification()` from Member 4's utils inside their own controllers.
