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
| Member 3 | Operations | `[x]` booking + maintenance routes & controllers | `[x]` ResourceBookingPage + MaintenancePage | Phase 2, 3, 6, 7 complete — awaiting auth middleware & utilities |
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

### DONE — Backend Auth Routes & Middleware

- [x] POST /auth/signup — create EMPLOYEE with bcrypt + JWT
- [x] POST /auth/login — verify credentials, reject INACTIVE users
- [x] POST /auth/forgot-password — log to console (demo mode)
- [x] GET /auth/me — return current user from JWT
- [x] auth.middleware.js — JWT verify → req.user
- [x] role.middleware.js — RBAC
- [x] validate.middleware.js — body validation
- [x] error.middleware.js — global error handler
- [x] department.routes.js — GET, POST, PATCH /departments
- [x] category.routes.js — GET, POST, PATCH /categories
- [x] user.routes.js — GET /users, PATCH /role, PATCH /status
- [x] server.js — Express entry point, CORS, route registration
- [x] config/prisma.js — Prisma client singleton
- [x] config/jwt.js — secret + expiry

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
**Branch:** `member3`
**Depends on:** Member 1's auth.middleware.js, Member 2's /assets GET endpoint, Member 4's utilities

### Backend

- [x] `booking.routes.js` — GET /bookings, POST /bookings, PATCH /bookings/:id/cancel
- [x] `booking.controller.js` — overlap SQL query (Prisma), 409 with conflictingBooking, effective status computation
- [x] `maintenance.routes.js` — 7 endpoints: GET, POST, approve, reject, assign, start, resolve
- [x] `maintenance.controller.js` — full status machine with state guards
- [x] Auto asset status: `AVAILABLE → UNDER_MAINTENANCE` on approve (prisma.$transaction)
- [x] Auto asset status: `UNDER_MAINTENANCE → AVAILABLE` on resolve (prisma.$transaction)
- [x] Auth middleware wired — `authenticate` + `anyAuthenticatedUser` + `assetManagerOrAbove` all live in routes
- [x] `req.user.id` used in all controllers (no more TEMP_USER_ID)
- [x] Owner permission check in `cancelBooking` now live
- [x] CommonJS conversion complete — all 4 files use `require`/`module.exports`
- [~] createLog() + createNotification() wired (TODO placeholders — TODO [MEMBER 4])

### Frontend

- [x] `src/api/bookingApi.js` — getBookings, createBooking, cancelBooking, getBookableAssets (mock)
- [x] `src/api/maintenanceApi.js` — all 7 API functions, mock assets + users
- [x] `pages/ResourceBooking/ResourceBookingPage.jsx` — asset selector, CalendarTimeline (8AM–8PM), booking form, ConflictBanner on 409, cancel action
- [x] `pages/Maintenance/MaintenancePage.jsx` — 5-column Kanban, MaintenanceCard, RaiseRequestModal, AssignTechnicianModal, ResolveModal, RejectModal
- [~] DashboardLayout wrap pending — TODO [MEMBER 1]
- [~] App.jsx route registration pending — PR to Member 1
- [~] Live asset dropdown pending — TODO [MEMBER 2]

### TODOS Remaining (Blocked)

| # | Blocked On | Action Required |
|---|-----------|----------------|
| 1 | ~~Member 1~~ DONE | ✅ Auth middleware wired, req.user.id live, CommonJS conversion done |
| 2 | ~~Self — Phase 5~~ DONE | ✅ Routes registered in `server.js` — `/api/v1/bookings` + `/api/v1/maintenance-requests` live |
| 3 | Member 1 Pending | Wrap ResourceBookingPage + MaintenancePage in DashboardLayout |
| 4 | Self — Phase 8 | Add /booking + /maintenance to App.jsx |
| 5 | Member 2 | Replace MOCK_BOOKABLE_ASSETS + MOCK_ASSETS with live GET /assets |
| 6 | Member 4 | Replace all createLog() + createNotification() TODO placeholders |

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
| 2.0 | Auth Ready — Member 1 auth middleware live; Member 4 delivers utilities | [x] Done | Auth wired in Member 3's routes + controllers (Phase 4 complete) |
| 4.0 | Core APIs — Members 1–3 backend endpoints working | [~] Partial | Member 3 backend fully live — Members 2 & 4 pending |
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
