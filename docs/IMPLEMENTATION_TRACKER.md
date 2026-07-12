# AssetFlow — Implementation Tracker

> **Purpose:** Single source of truth for tracking what each member has built, what is pending, and what is verified. Update this file every time a feature is completed or merged to `dev`.
>
> **Last Updated:** 2026-07-12 — Initial creation after verifying Member 1's PR merge.

---

## Legend

| Symbol | Meaning |
|--------|---------|
| `[x]` | Done & verified |
| `[~]` | In progress / partially done |
| `[ ]` | Not started |
| `[!]` | Done but has a known issue |
| `[N/A]` | Out of scope / not required |

---

## Overall Progress

| Member | Module | Backend | Frontend | Status |
|--------|--------|---------|----------|--------|
| Member 1 | Identity & Foundation | `[~]` Schema only | `[x]` Login + Register | Partially complete — auth routes pending |
| Member 2 | Asset Core | `[ ]` | `[ ]` | Not started |
| Member 3 | Operations | `[ ]` | `[ ]` | Not started |
| Member 4 | Intelligence | `[ ]` | `[ ]` | Not started |

---

## Member 1 — Identity & Foundation

**Screens Owned:** Screen 1 (Login/Signup) + Screen 3 (Organization Setup)
**Branch merged:** `feat/login` + `database` into `main` (PR #1 & #2)

### DONE — Backend Prisma Schema

- [x] All enums match DATABASE_SCHEMA.md exactly (Role, UserStatus, DepartmentStatus, AssetStatus, AllocationStatus, TransferStatus, BookingStatus, MaintenancePriority, MaintenanceStatus, AuditStatus, AuditItemStatus)
- [x] Department model — headId, parentDepartmentId hierarchy, DepartmentStatus
- [x] User model — email, passwordHash, role, status, departmentId, all relations
- [x] AssetCategory model
- [x] Asset model — assetTag, serialNumber, isBookable, all fields
- [x] Allocation model — with @@index([assetId, status])
- [x] Transfer model — fromUser/toUser/requestedBy relations
- [x] Booking model — with @@index([assetId, startTime])
- [x] MaintenanceRequest model — with @@index([assetId, status])
- [x] AuditCycle + AuditItem models
- [x] Notification model — with @@index([userId, isRead])
- [x] ActivityLog model — with @@index([createdAt]), User relation
- [x] All models use @@map() snake_case table names
- [x] Cascade / SetNull / Restrict delete rules defined
- [x] Migration done — Supabase DB created (commit fd6664c)

### PENDING — Backend Auth Routes & Middleware

- [ ] POST /auth/signup — create EMPLOYEE with bcrypt + JWT
- [ ] POST /auth/login — verify credentials, reject INACTIVE users
- [ ] POST /auth/forgot-password — log to console (demo mode)
- [ ] GET /auth/me — return current user from JWT
- [ ] auth.middleware.js — JWT verify → req.user
- [ ] role.middleware.js — RBAC
- [ ] validate.middleware.js — body validation
- [ ] error.middleware.js — global error handler
- [ ] department.routes.js — GET, POST, PATCH /departments
- [ ] category.routes.js — GET, POST, PATCH /categories
- [ ] user.routes.js — GET /users, PATCH /role, PATCH /status
- [ ] server.js — Express entry point, CORS, route registration
- [ ] config/prisma.js — Prisma client singleton
- [ ] config/jwt.js — secret + expiry

### DONE — Frontend

- [x] Vite + React 18 + Tailwind CSS v4 + React Router v7 scaffold
- [x] vite.config.js — proxy /api → localhost:5000
- [x] src/index.css — Inter font, Tailwind import, base reset
- [x] src/api/authApi.js — Axios instance, base /api/v1, JWT interceptor
- [x] src/components/PasswordInput/PasswordInput.jsx — show/hide toggle
- [x] src/pages/Login/LoginPage.jsx — form, validation, role redirect
- [x] src/pages/Register/RegisterPage.jsx — signup form, dept dropdown
- [x] src/App.jsx — BrowserRouter with /login, /register, /dashboard routes

### PENDING — Frontend (Member 1)

- [ ] src/context/AuthContext.jsx — currentUser, login(), logout()
- [ ] src/layouts/DashboardLayout.jsx — Sidebar + content shell
- [ ] src/pages/OrganizationSetup/ — Screen 3 (3 tabs: Departments, Categories, Employee Directory)
- [ ] Protected route wrapper — redirect unauth users to /login
- [ ] src/hooks/useAuth.js

### ISSUES FOUND

| # | Severity | Issue | Location | Action |
|---|----------|-------|----------|--------|
| 1 | ~~MUST FIX~~ FIXED | Password min-length was 6; SHARED_ENUMS.md specifies 8 | RegisterPage.jsx L21 | **Fixed** — changed to `< 8` |
| 2 | ~~MUST FIX~~ FIXED | JWT interceptor only read localStorage; sessionStorage tokens were ignored | authApi.js L18 | **Fixed** — interceptor now checks both |
| 3 | Medium | LoginPage stores JWT without calling AuthContext.login() — update once AuthContext is built | LoginPage.jsx L89–95 | Update after AuthContext is built |
| 4 | Low | RegisterPage redirects to /login after signup — WORKFLOW.md says Dashboard. Acceptable for demo. | RegisterPage.jsx L97 | Low priority |
| 5 | Low | App.css contains unused Vite boilerplate CSS (.hero, .ticks, etc.) | App.css | Cleanup |

---

## Member 2 — Asset Core

**Screens Owned:** Screen 4 (Asset Directory) + Screen 5 (Allocation & Transfer)
**Depends on:** Member 1's auth.middleware.js (blocking), Member 4's createLog()/createNotification()

### Backend

- [ ] asset.routes.js + controller (GET with filters, POST, GET/:id, PATCH/:id)
- [ ] utils/assetTagGenerator.js — AF-XXXX auto-generation
- [ ] allocation.routes.js + controller (POST with 409 conflict, PATCH /return)
- [ ] transfer.routes.js + controller (POST, PATCH /approve, PATCH /reject)

### Frontend

- [ ] pages/Assets/ — registration form + directory table with search + filter
- [ ] pages/AllocationTransfer/ — allocation form + conflict display + transfer form + history
- [ ] Asset detail page — allocation history + maintenance history tabs

---

## Member 3 — Operations

**Screens Owned:** Screen 6 (Resource Booking) + Screen 7 (Maintenance)
**Depends on:** Member 1's auth.middleware.js, Member 2's /assets GET endpoint, Member 4's utilities

### Backend

- [ ] booking.routes.js + controller (POST with overlap SQL, GET, PATCH /cancel)
- [ ] maintenance.routes.js + controller (POST, PATCH /approve, /reject, /assign, /start, /resolve)
- [ ] Auto asset status: AVAILABLE → UNDER_MAINTENANCE on approve; → AVAILABLE on resolve

### Frontend

- [ ] pages/ResourceBooking/ — resource selector, calendar view, booking form, conflict display
- [ ] pages/Maintenance/ — Kanban board 5 columns (Pending → Resolved), card actions

---

## Member 4 — Intelligence

**Screens Owned:** Screen 2 (Dashboard) + Screen 8 (Audit) + Screen 9 (Reports) + Screen 10 (Notifications)
**NOTE: Shared utilities are CRITICAL blockers for all other members**

### Shared Utilities — DELIVER FIRST

- [ ] src/utils/createLog.js — createLog(userId, action, entityType, entityId, details)
- [ ] src/utils/createNotification.js — createNotification(userId, title, message, type, category)

### Backend

- [ ] dashboard.routes.js — GET /dashboard/kpi, GET /dashboard/recent-activity
- [ ] audit.routes.js + controller (CRUD, item verify, discrepancy report, close cycle)
- [ ] report.routes.js — 8 endpoints + CSV export
- [ ] notification.routes.js — GET, unread-count, mark-read, mark-all-read
- [ ] activityLog.routes.js — paginated GET

### Frontend

- [ ] pages/Dashboard/ — 6 KPI cards, overdue banner, quick actions, recent activity
- [ ] pages/Audit/ — cycle list, create form, checklist, discrepancy view
- [ ] pages/Reports/ — charts (recharts), export button
- [ ] pages/Notifications/ — tabs (All|Alerts|Approvals|Bookings), mark-read
- [ ] components/NotificationBell.jsx — unread count badge

---

## Integration Checkpoints

| Hour | Checkpoint | Status | Notes |
|------|-----------|--------|-------|
| 0.5 | Schema Freeze — Member 1 pushes schema, all pull + npx prisma generate | [x] Done | Schema merged, Supabase DB created |
| 2.0 | Auth Ready — Member 1 auth middleware live; Member 4 delivers utilities | [ ] Pending | Auth routes not yet built |
| 4.0 | Core APIs — Members 1–3 backend endpoints working | [ ] Pending | — |
| 5.5 | UI Integration — Frontend wired to live APIs | [ ] Pending | — |
| 7.0 | Feature Freeze | [ ] Pending | — |
| 7.5 | Final merge to main, demo rehearsal | [ ] Pending | — |

---

## Critical Path (Blockers)

> Fix these first — they block everyone else.

1. **[Member 1]** Build auth.middleware.js + role.middleware.js → unblocks Members 2 & 3 from protecting routes
2. **[Member 1]** Build DashboardLayout.jsx → unblocks Members 2, 3 & 4 from building inner pages
3. **[Member 4]** Deliver createLog() + createNotification() utilities → unblocks all controller side effects
4. **[FIXED]** ~~[Member 1] Fix password min-length in RegisterPage.jsx (6 → 8)~~
5. **[FIXED]** ~~[Member 1] Fix JWT interceptor in authApi.js to also check sessionStorage~~
