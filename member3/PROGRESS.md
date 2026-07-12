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

### TODOs remaining (blocked on other members)
- [ ] `// TODO [MEMBER 1]` — replace `req.user?.id ?? 'TEMP_USER_ID'` with real `req.user.id`
- [ ] `// TODO [MEMBER 1]` — uncomment `authenticate` + `authorize` imports
- [ ] `// TODO [MEMBER 4]` — uncomment `createNotification(BOOKING_CONFIRMED)` + `createLog()` calls

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

### TODOs remaining (blocked on other members)
- [ ] `// TODO [MEMBER 1]` — uncomment auth middleware in routes
- [ ] `// TODO [MEMBER 4]` — uncomment `createNotification(MAINTENANCE_APPROVED/REJECTED)` + `createLog()` calls

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
- [ ] Add `/booking` route to `App.jsx` via PR to Member 1

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
- [ ] Add `/maintenance` route to `App.jsx` via PR to Member 1

---

## Pending (Waiting on Other Members)

| Task | Waiting for | When |
|------|------------|------|
| Register `booking.routes.js` in `server.js` | Member 1 to create `server.js` | Hour 0.5–1 |
| Register `maintenance.routes.js` in `server.js` | Member 1 to create `server.js` | Hour 0.5–1 |
| Uncomment `authenticate` + `authorize` in routes | Member 1's auth.middleware.js | Hour 2 |
| Replace `TEMP_USER_ID` with `req.user.id` | Member 1's auth.middleware.js | Hour 2 |
| Wire `createLog()` + `createNotification()` | Member 4's utilities | Hour 2 |
| Replace mock assets with live `GET /assets` | Member 2's asset endpoint | Hour 1.5–2 |
| Replace mock users with live `GET /users` | Member 1's user endpoint | Hour 2–3 |
| Wrap pages in `DashboardLayout` | Member 1's DashboardLayout.jsx | Hour 2–3 |
| Add routes to `App.jsx` | PR to Member 1 | Hour 3 |

---

## Acceptance Criteria Checklist (from ACCEPTANCE_CRITERIA.md)

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
