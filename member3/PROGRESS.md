# Member 3 — Progress Tracker

> **Owner:** Member 3 — Operations Module  
> **Branch:** `member3`  
> **Screens:** Screen 6 (Resource Booking) + Screen 7 (Maintenance Management)  
> **Last Updated:** 2026-07-12

---

## Phase 2 — Backend: Booking Module ✅ COMPLETE

| File | Status | Notes |
|------|--------|-------|
| `backend/src/routes/booking.routes.js` | ✅ Done | Auth middleware TODO-commented; uncomment when Member 1 delivers |
| `backend/src/controllers/booking.controller.js` | ✅ Done | Full overlap SQL query, all 3 endpoints, status guard logic |

### What's in `booking.controller.js`
- `getBookings` — filters by assetId, userId, date, status; computes effective status
- `createBooking` — validates duration (min 15 min, max 8h), checks isBookable, runs overlap query, returns 409 with `conflictingBooking`
- `cancelBooking` — state guards, owner/role permission stub

### Phase 4 completions for Phase 2
- [x] `// TODO [MEMBER 1]` — `req.user.id` now live (auth middleware wired)
- [x] `// TODO [MEMBER 1]` — `authenticate` + `anyAuthenticatedUser` imported and active
- [x] `// TODO [MEMBER 1]` — owner/manager permission check in `cancelBooking` now live
- [x] `// TODO [MEMBER 4]` — `createNotification(BOOKING_CONFIRMED)` + `createLog()` now wired

---

## Phase 3 — Backend: Maintenance Module ✅ COMPLETE

| File | Status | Notes |
|------|--------|-------|
| `backend/src/routes/maintenance.routes.js` | ✅ Done | 7 endpoints, role guards TODO-commented |
| `backend/src/controllers/maintenance.controller.js` | ✅ Done | Full status machine, 2 atomic transactions |

### What's in `maintenance.controller.js`
- `getMaintenanceRequests` — filter by status, assetId, priority; includes asset + requestedBy + technician
- `createMaintenanceRequest` — validates priority enum, verifies asset exists, status: PENDING_APPROVAL
- `approveRequest` — `prisma.$transaction`: sets request → APPROVED **AND** asset → UNDER_MAINTENANCE atomically
- `rejectRequest` — validates PENDING_APPROVAL source state, stores reason in resolvedNotes
- `assignTechnician` — validates APPROVED source state, verifies technician user exists
- `startWork` — validates TECHNICIAN_ASSIGNED source state
- `resolveRequest` — `prisma.$transaction`: sets request → RESOLVED **AND** asset → AVAILABLE atomically

### Phase 4 completions for Phase 3
- [x] `// TODO [MEMBER 1]` — auth middleware wired (`authenticate` + `assetManagerOrAbove`)
- [x] `// TODO [MEMBER 1]` — `req.user.id` now live in all 5 controller functions
- [x] `// TODO [MEMBER 4]` — `createNotification(MAINTENANCE_APPROVED/REJECTED)` + `createLog()` now wired

---

## Phase 6 — Frontend: Booking API + Page ✅ COMPLETE

| File | Status | Notes |
|------|--------|-------|
| `frontend/src/api/bookingApi.js` | ✅ Done | Mock assets until Member 2 delivers GET /assets |
| `frontend/src/pages/ResourceBooking/ResourceBookingPage.jsx` | ✅ Done | Full UI: calendar, form, conflict banner |

### What's in `ResourceBookingPage.jsx`
- Bookable asset dropdown (from mock, TODO swap to live)
- Date picker
- CalendarTimeline — custom CSS grid, 8AM–8PM, bookings as positioned blocks
- BookingForm — start/end time, purpose, duration hint
- ConflictBanner — shows on 409 with conflicting booking details (name, time)
- BookingCard list with Cancel button

### TODOs remaining
- [ ] `// TODO [MEMBER 2]` — swap MOCK_BOOKABLE_ASSETS with `GET /assets?isBookable=true`
- [ ] `// TODO [MEMBER 1]` — wrap page in `<DashboardLayout>` once delivered
- [x] Add `/bookings` route to `App.jsx` — registered under `ProtectedRoute + DashboardLayout`

---

## Phase 7 — Frontend: Maintenance API + Kanban ✅ COMPLETE

| File | Status | Notes |
|------|--------|-------|
| `frontend/src/api/maintenanceApi.js` | ✅ Done | All 7 API functions, mocks for assets + users |
| `frontend/src/pages/Maintenance/MaintenancePage.jsx` | ✅ Done | Full Kanban, all 4 modals |

### What's in `MaintenancePage.jsx`
- 5 KanbanColumns: Pending | Approved | Technician Assigned | In Progress | Resolved
- MaintenanceCard with priority badges (CRITICAL=red, HIGH=orange, MEDIUM=yellow, LOW=gray)
- Per-status action buttons (button-click only, no drag-and-drop)
- RaiseRequestModal — asset dropdown, description, priority, photo URL
- AssignTechnicianModal — user dropdown
- ResolveModal — resolvedNotes textarea
- RejectModal — optional reason

### TODOs remaining
- [ ] `// TODO [MEMBER 2]` — swap MOCK_ASSETS with `GET /assets`
- [ ] `// TODO [MEMBER 1]` — swap MOCK_USERS with `GET /users` + wrap in DashboardLayout
- [x] `// TODO [MEMBER 1]` — wrap page in `<DashboardLayout>` — done via App.jsx route nesting

---

## Phase 4 — Auth Middleware Wired ✅ COMPLETE

| Task | Status | Notes |
|------|--------|-------|
| Convert `booking.routes.js` to CommonJS | ✅ Done | `const express = require('express')` + live auth |
| Convert `booking.controller.js` to CommonJS | ✅ Done | `req.user.id` live, `module.exports` added |
| Convert `maintenance.routes.js` to CommonJS | ✅ Done | `anyAuthenticatedUser` + `assetManagerOrAbove` wired |
| Convert `maintenance.controller.js` to CommonJS | ✅ Done | All 7 functions, `req.user.id` live everywhere |
| Owner check in `cancelBooking` | ✅ Done | `isOwner \|\| isManager` fully live — no longer commented |

### Key: exact names used from Member 1's middleware
```js
const { authenticate }            = require('../middleware/auth.middleware');
const { anyAuthenticatedUser,
        assetManagerOrAbove }     = require('../middleware/role.middleware');
const prisma                      = require('../config/prisma');
```

### TODOs remaining
- [x] `// TODO [MEMBER 4]` — all `createLog()` + `createNotification()` placeholders now wired
- [ ] Phase 5 — Register routes in `server.js` (next step)

---

## Phase 5 — Register Routes in server.js ✅ COMPLETE

| Task | Status | Notes |
|------|--------|-------|
| Add `bookingRoutes` import to `server.js` | ✅ Done | `require('./src/routes/booking.routes')` |
| Add `maintenanceRoutes` import to `server.js` | ✅ Done | `require('./src/routes/maintenance.routes')` |
| Register `GET\|POST /api/v1/bookings` | ✅ Done | `app.use('/api/v1/bookings', bookingRoutes)` |
| Register `GET\|POST /api/v1/maintenance-requests` | ✅ Done | `app.use('/api/v1/maintenance-requests', maintenanceRoutes)` |

> **Backend is now fully wired and ready to test.** Start the server with `cd backend && npm run dev`.


## Pending (Waiting on Other Members)

| Task | Waiting for | Status |
|------|------------|--------|
| Register `booking.routes.js` in `server.js` | Add 2 lines to server.js | ⏳ Phase 5 — next |
| Register `maintenance.routes.js` in `server.js` | Add 2 lines to server.js | ⏳ Phase 5 — next |
| Wire `createLog()` + `createNotification()` | Member 4's utilities | ✅ Done |
| Replace mock assets with live `GET /assets` | Member 2's asset endpoint | ❌ Blocked |
| Swap MOCK_USERS with live `GET /users` | Note: `GET /users` is Admin-only — keep mock | ⚠️ Design issue |
| Wrap pages in `DashboardLayout` | Member 1's DashboardLayout.jsx | ❌ Pending |
| Add /bookings + /maintenance to App.jsx | Phase 8 | ✅ Done |

---

## Phase 8 — Frontend Route Registration ✅ COMPLETE

| Task | Status | Notes |
|------|--------|-------|
| Import `ResourceBookingPage` into `App.jsx` | ✅ Done | `import ResourceBookingPage from './pages/ResourceBooking/ResourceBookingPage'` |
| Import `MaintenancePage` into `App.jsx` | ✅ Done | `import MaintenancePage from './pages/Maintenance/MaintenancePage'` |
| Add `<Route path="/bookings" ...>` | ✅ Done | Screen 6 accessible at `/bookings` |
| Add `<Route path="/maintenance" ...>` | ✅ Done | Screen 7 accessible at `/maintenance` |

### TODOs remaining
- [x] `// TODO [MEMBER 1]` — `<ResourceBookingPage />` wrapped in `<DashboardLayout>` via App.jsx route nesting
- [x] `// TODO [MEMBER 1]` — `<MaintenancePage />` wrapped in `<DashboardLayout>` via App.jsx route nesting
- [ ] `// TODO [MEMBER 2]` — Replace `MOCK_BOOKABLE_ASSETS` in `bookingApi.js` with live `GET /assets?isBookable=true`
- [ ] `// TODO [MEMBER 2]` — Replace `MOCK_ASSETS` in `maintenanceApi.js` with live `GET /assets`
- [x] `// TODO [MEMBER 4]` — Uncomment all `createLog()` + `createNotification()` calls in both controllers


### Screen 6 — Resource Booking
- [x] Employee can book a shared resource (isBookable: true) — form + API implemented
- [x] Backend rejects overlapping bookings with 409 + conflict details — overlap query implemented
- [x] Calendar/timeline view shows existing bookings — CalendarTimeline implemented
- [ ] ⏳ Live end-to-end test pending (needs auth + server.js)

### Screen 7 — Maintenance Management
- [x] Any user can raise a maintenance request with issue description and priority
- [x] Asset Manager can approve → asset status auto-changes to UNDER_MAINTENANCE (atomic transaction)
- [x] Asset Manager can assign a technician and start the work
- [x] Resolving auto-changes asset status back to AVAILABLE (atomic transaction)
- [x] Kanban board with 5 columns displayed
- [ ] ⏳ Live end-to-end test pending (needs auth + server.js)
