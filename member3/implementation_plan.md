# Member 3 — Operations Module Implementation Plan

## Overview

**Member:** 3 — Operations  
**Screens:** Screen 6 (Resource Booking) + Screen 7 (Maintenance Management)  
**Branch convention:** `feature/booking-calendar` and `feature/maintenance-kanban`  
**Commit prefix:** `[BOOKING]` and `[MAINT]`  
**Tables owned:** `Booking`, `MaintenanceRequest`  
**Current status per tracker:** `[ ]` — Not started

---

## Context & Current State (from IMPLEMENTATION_TRACKER.md)

| Item | Status |
|------|--------|
| Prisma schema (`Booking`, `MaintenanceRequest` models + indexes) | **[x] Done** — merged by Member 1 (commit fd6664c) |
| Member 1 auth middleware (`auth.middleware.js`) | **[ ] Pending** — blocker |
| Member 4 `createLog()` utility | **[ ] Pending** — needed for side effects |
| Member 4 `createNotification()` utility | **[ ] Pending** — needed for side effects |
| Member 2 `GET /assets` endpoint | **[ ] Pending** — needed for asset dropdowns |

> [!IMPORTANT]
> Member 3 is **blocked on auth middleware** from Member 1 before routes can be protected.
> Member 3 is **blocked on `createLog()` + `createNotification()`** from Member 4 for controller side effects.
> Until these arrive, implement backend controllers with a **TODO placeholder** for the utility calls, and use **mock API data** on the frontend.

---

## Tech Stack Constraints (from TECH_STACK_FREEZE.md)

- **Frontend:** React 19 + React Router v7 + Tailwind CSS v4 + Axios + `lucide-react`
- **Calendar:** `react-big-calendar` or a **custom CSS grid calendar** (prefer simpler if sufficient)
- **Kanban:** Button-click actions only — NO heavy drag-and-drop libraries
- **HTTP:** Shared Axios instance from `src/api/authApi.js` — never standalone `fetch()`
- **NO Redux** — use React state + simple prop drilling / context
- **Date library:** `date-fns` or `dayjs` — pick one and be consistent

---

## Files Member 3 Owns (Must NOT touch others)

### Backend
- `backend/src/routes/booking.routes.js` ← **CREATE**
- `backend/src/controllers/booking.controller.js` ← **CREATE**
- `backend/src/routes/maintenance.routes.js` ← **CREATE**
- `backend/src/controllers/maintenance.controller.js` ← **CREATE**

### Frontend
- `frontend/src/pages/ResourceBooking/` ← **CREATE** (Screen 6)
- `frontend/src/pages/Maintenance/` ← **CREATE** (Screen 7)
- `frontend/src/api/bookingApi.js` ← **CREATE**
- `frontend/src/api/maintenanceApi.js` ← **CREATE**

### Shared file edits (coordinate with team)
- `frontend/src/App.jsx` — add routes for `/booking` and `/maintenance` (via PR)
- `backend/server.js` — register booking + maintenance routes (coordinate with Member 1)

---

## Dependency Map

```
Member 1 (auth.middleware.js)
    │
    ▼
Member 3 Backend Controllers (can protect routes)
    │
    ▼
Member 3 Frontend (can wire to live API instead of mocks)
    │
Member 4 (createLog, createNotification)
    │
    ▼
Member 3 Controller side effects (call utilities after write ops)
    │
Member 2 (GET /assets)
    │
    ▼
Member 3 Frontend asset dropdowns (replace mock list with live data)
```

---

## Phase-by-Phase Plan

---

## Phase 1 — Setup & Pre-Work (Hour 0–0.5)

> **Goal:** Pull the team's initial scaffold, verify schema, set up your branches. No code written yet — just environment prep.

### Steps

1. **Pull `dev` branch** after Member 1 pushes the initial Prisma schema scaffold.
2. Run `npx prisma generate` from the `backend/` directory to generate the Prisma Client.
3. **Verify the schema** has your tables (open `backend/prisma/schema.prisma`):
   - `model Booking` with `@@index([assetId, startTime])`
   - `model MaintenanceRequest` with `@@index([assetId, status])`
   - All enums: `BookingStatus`, `MaintenancePriority`, `MaintenanceStatus`
4. Create your two feature branches from `dev`:
   ```bash
   git checkout dev && git pull
   git checkout -b feature/booking-calendar
   ```

### Verification Checklist
- [ ] `npx prisma generate` runs with zero errors
- [ ] Both models and all enums are present in schema.prisma
- [ ] You can see the Supabase DB URL in `.env`

---

## Phase 2 — Backend: Booking Module (Hour 1–2.5)

> **Goal:** Build `booking.routes.js` + `booking.controller.js` with full overlap validation logic.
> Work on branch: `feature/booking-calendar`

### 2.1 — Create `backend/src/routes/booking.routes.js`

**File:** `backend/src/routes/booking.routes.js`

Register 3 endpoints:

| Method | Path | Controller Function | Auth Required | Role |
|--------|------|-------------------|--------------|------|
| `GET` | `/bookings` | `getBookings` | Yes | Any authenticated |
| `POST` | `/bookings` | `createBooking` | Yes | Any authenticated |
| `PATCH` | `/bookings/:id/cancel` | `cancelBooking` | Yes | Owner or Asset Manager |

```javascript
// booking.routes.js skeleton
import express from 'express';
import { getBookings, createBooking, cancelBooking } from '../controllers/booking.controller.js';
// import { authenticate } from '../middleware/auth.middleware.js'; ← uncomment when Member 1 delivers
// import { authorize } from '../middleware/role.middleware.js';   ← uncomment when Member 1 delivers

const router = express.Router();

router.get('/', /* authenticate, */ getBookings);
router.post('/', /* authenticate, */ createBooking);
router.patch('/:id/cancel', /* authenticate, */ cancelBooking);

export default router;
```

> [!IMPORTANT]
> Leave auth middleware imports commented out with a `TODO` comment until Member 1 delivers `auth.middleware.js`. This lets you test endpoints immediately without being blocked.

### 2.2 — Create `backend/src/controllers/booking.controller.js`

#### `getBookings` — `GET /bookings`

- Accept query params: `?assetId=...&userId=...&date=ISO8601&status=...`
- Use Prisma `where` clause to filter
- Include related `user` (name) and `asset` (name, assetTag) in response
- Response shape:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "assetId": "uuid",
      "asset": { "assetTag": "AF-0012", "name": "Conference Room B2" },
      "userId": "uuid",
      "user": { "name": "Priya Shah" },
      "startTime": "ISO8601",
      "endTime": "ISO8601",
      "status": "UPCOMING",
      "purpose": "Team sync"
    }
  ]
}
```

#### `createBooking` — `POST /bookings`

**This is the most critical function — it contains the overlap validation.**

Request body:
```json
{ "assetId": "uuid", "startTime": "ISO8601", "endTime": "ISO8601", "purpose": "..." }
```

**Step-by-step logic:**
1. Validate request body — all three fields required, `endTime > startTime`, minimum 15 minutes duration (per `SHARED_ENUMS.md`: `BOOKING_MIN_DURATION_MINUTES = 15`), maximum 8 hours.
2. Verify the asset exists and `isBookable === true`. If not: `400 Bad Request`.
3. **Overlap query** (exact SQL from `WORKFLOW.md` Section 6):
```javascript
const conflict = await prisma.booking.findFirst({
  where: {
    assetId: body.assetId,
    status: { not: 'CANCELLED' },
    startTime: { lt: new Date(body.endTime) },
    endTime:   { gt: new Date(body.startTime) },
  },
  include: { user: { select: { name: true } } },
});

if (conflict) {
  return res.status(409).json({
    success: false,
    error: {
      code: 'BOOKING_OVERLAP',
      message: 'The requested time slot overlaps with an existing booking.',
      details: {
        conflictingBooking: {
          startTime: conflict.startTime,
          endTime:   conflict.endTime,
          bookedBy:  conflict.user.name,
        },
      },
    },
  });
}
```
4. Create the `Booking` record with `status: 'UPCOMING'`, `userId: req.user.id`.
5. **Side effects (placeholder — wire up when Member 4 delivers utils):**
```javascript
// TODO: await createNotification(userId, 'Booking Confirmed', `Your booking for ${asset.name} is confirmed`, 'BOOKING_CONFIRMED', 'BOOKINGS');
// TODO: await createLog(req.user.id, 'BOOKING_CREATED', 'Booking', booking.id, { assetId, startTime, endTime });
```
6. Return `201` with the new booking object.

#### `cancelBooking` — `PATCH /bookings/:id/cancel`

1. Find booking by `id`. Return `404` if not found.
2. Verify booking belongs to `req.user.id` OR `req.user.role` is `ASSET_MANAGER` or `ADMIN`. Return `403` otherwise.
3. Verify booking is not already `CANCELLED` or `COMPLETED`.
4. Update `status → 'CANCELLED'`.
5. **Side effects (placeholder):**
```javascript
// TODO: await createNotification(booking.userId, 'Booking Cancelled', `...`, 'BOOKING_CANCELLED', 'BOOKINGS');
// TODO: await createLog(req.user.id, 'BOOKING_CANCELLED', 'Booking', booking.id, {});
```
6. Return `200` with updated booking.

### 2.3 — Register route in `server.js`

Coordinate with Member 1. Add one line:
```javascript
app.use('/api/v1/bookings', bookingRouter);
```

### Phase 2 Verification
- [ ] `GET /api/v1/bookings` returns empty array (no auth yet)
- [ ] `POST /api/v1/bookings` with valid body creates a booking
- [ ] `POST /api/v1/bookings` with overlapping time returns `409` with `conflictingBooking` details
- [ ] `POST /api/v1/bookings` on non-bookable asset returns `400`
- [ ] `PATCH /api/v1/bookings/:id/cancel` sets status to `CANCELLED`

---

## Phase 3 — Backend: Maintenance Module (Hour 2.5–4)

> **Goal:** Build `maintenance.routes.js` + `maintenance.controller.js` with full Kanban status machine and auto asset status updates.
> Work on branch: `feature/maintenance-kanban`

### 3.1 — Create `backend/src/routes/maintenance.routes.js`

| Method | Path | Controller Function | Role |
|--------|------|-------------------|------|
| `GET` | `/maintenance-requests` | `getMaintenanceRequests` | Any authenticated |
| `POST` | `/maintenance-requests` | `createMaintenanceRequest` | Any authenticated |
| `PATCH` | `/maintenance-requests/:id/approve` | `approveRequest` | ASSET_MANAGER |
| `PATCH` | `/maintenance-requests/:id/reject` | `rejectRequest` | ASSET_MANAGER |
| `PATCH` | `/maintenance-requests/:id/assign` | `assignTechnician` | ASSET_MANAGER |
| `PATCH` | `/maintenance-requests/:id/start` | `startWork` | ASSET_MANAGER |
| `PATCH` | `/maintenance-requests/:id/resolve` | `resolveRequest` | ASSET_MANAGER |

```javascript
// maintenance.routes.js skeleton
import express from 'express';
import {
  getMaintenanceRequests, createMaintenanceRequest,
  approveRequest, rejectRequest, assignTechnician,
  startWork, resolveRequest
} from '../controllers/maintenance.controller.js';

const router = express.Router();

router.get('/', getMaintenanceRequests);
router.post('/', createMaintenanceRequest);
router.patch('/:id/approve', approveRequest);
router.patch('/:id/reject', rejectRequest);
router.patch('/:id/assign', assignTechnician);
router.patch('/:id/start', startWork);
router.patch('/:id/resolve', resolveRequest);

export default router;
```

### 3.2 — Create `backend/src/controllers/maintenance.controller.js`

#### `getMaintenanceRequests` — `GET /maintenance-requests`

- Accepts: `?status=...&assetId=...&priority=...`
- Include: `asset` (assetTag, name), `requestedBy` (name), `technician` (name, nullable)
- Return paginated list ordered by `createdAt DESC`

#### `createMaintenanceRequest` — `POST /maintenance-requests`

Request body:
```json
{ "assetId": "uuid", "issueDescription": "...", "priority": "LOW|MEDIUM|HIGH|CRITICAL", "photoUrl": "..." }
```

1. Validate `priority` is one of the four canonical values from `SHARED_ENUMS.md`.
2. Verify asset exists.
3. Create `MaintenanceRequest` with `status: 'PENDING_APPROVAL'`, `requestedById: req.user.id`.
4. Side effects placeholder: `// TODO: createLog()`
5. Return `201`.

#### `approveRequest` — `PATCH /maintenance-requests/:id/approve`

**This is the critical auto-status-update path:**

1. Find request by `id`. Return `404` if not found.
2. Validate current status is `PENDING_APPROVAL`. Return `400` if not.
3. **Prisma transaction** — update both records atomically:
```javascript
await prisma.$transaction([
  prisma.maintenanceRequest.update({
    where: { id },
    data: { status: 'APPROVED' },
  }),
  prisma.asset.update({
    where: { id: request.assetId },
    data: { status: 'UNDER_MAINTENANCE' },
  }),
]);
```
4. Side effects placeholder:
```javascript
// TODO: await createNotification(request.requestedById, 'Maintenance Approved', `Your request for ${asset.name} has been approved.`, 'MAINTENANCE_APPROVED', 'APPROVALS');
// TODO: await createLog(req.user.id, 'MAINTENANCE_APPROVED', 'MaintenanceRequest', id, { assetId: request.assetId });
```
5. Return `200`.

#### `rejectRequest` — `PATCH /maintenance-requests/:id/reject`

Request body: `{ "reason": "..." }`

1. Validate current status is `PENDING_APPROVAL`.
2. Update `status → 'REJECTED'`, store reason in `resolvedNotes`.
3. Side effects placeholder: `// TODO: createNotification(..., 'MAINTENANCE_REJECTED', 'APPROVALS')`
4. Return `200`.

#### `assignTechnician` — `PATCH /maintenance-requests/:id/assign`

Request body: `{ "technicianId": "uuid" }`

1. Validate current status is `APPROVED`.
2. Verify technician user exists.
3. Update: `status → 'TECHNICIAN_ASSIGNED'`, `technicianId`.
4. Side effects placeholder: `// TODO: createLog()`
5. Return `200`.

#### `startWork` — `PATCH /maintenance-requests/:id/start`

1. Validate current status is `TECHNICIAN_ASSIGNED`.
2. Update: `status → 'IN_PROGRESS'`.
3. Side effects placeholder: `// TODO: createLog()`
4. Return `200`.

#### `resolveRequest` — `PATCH /maintenance-requests/:id/resolve`

Request body: `{ "resolvedNotes": "..." }`

**This is the second critical auto-status-update path:**

1. Validate current status is `IN_PROGRESS`.
2. **Prisma transaction** — update both records atomically:
```javascript
await prisma.$transaction([
  prisma.maintenanceRequest.update({
    where: { id },
    data: { status: 'RESOLVED', resolvedNotes: body.resolvedNotes },
  }),
  prisma.asset.update({
    where: { id: request.assetId },
    data: { status: 'AVAILABLE' },  // ← reverts from UNDER_MAINTENANCE
  }),
]);
```
3. Side effects placeholder: `// TODO: createLog()`
4. Return `200`.

### 3.3 — Register route in `server.js`

```javascript
app.use('/api/v1/maintenance-requests', maintenanceRouter);
```

### Phase 3 Verification
- [ ] `GET /maintenance-requests` returns empty array
- [ ] `POST /maintenance-requests` creates a request with `status: PENDING_APPROVAL`
- [ ] `PATCH /:id/approve` sets request to `APPROVED` AND asset to `UNDER_MAINTENANCE` (both must change atomically)
- [ ] `PATCH /:id/reject` sets request to `REJECTED`
- [ ] `PATCH /:id/assign` sets request to `TECHNICIAN_ASSIGNED`
- [ ] `PATCH /:id/start` sets request to `IN_PROGRESS`
- [ ] `PATCH /:id/resolve` sets request to `RESOLVED` AND asset back to `AVAILABLE`
- [ ] All status transitions reject invalid source states with `400`

---

## Phase 4 — Integrate Auth Middleware (After Member 1 Hour 2 checkpoint)

> **Goal:** Wire up `auth.middleware.js` and `role.middleware.js` to all booking and maintenance routes.

Once Member 1 announces "auth is ready, pull dev":

1. `git pull dev` into your feature branches.
2. In `booking.routes.js` — uncomment auth middleware:
```javascript
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

router.get('/', authenticate, getBookings);
router.post('/', authenticate, createBooking);
router.patch('/:id/cancel', authenticate, cancelBooking);
```
3. In `maintenance.routes.js` — add role protection on manager-only routes:
```javascript
const ASSET_MANAGER_ROLES = ['ASSET_MANAGER', 'ADMIN'];

router.get('/', authenticate, getMaintenanceRequests);
router.post('/', authenticate, createMaintenanceRequest);
router.patch('/:id/approve', authenticate, authorize(ASSET_MANAGER_ROLES), approveRequest);
router.patch('/:id/reject',  authenticate, authorize(ASSET_MANAGER_ROLES), rejectRequest);
router.patch('/:id/assign',  authenticate, authorize(ASSET_MANAGER_ROLES), assignTechnician);
router.patch('/:id/start',   authenticate, authorize(ASSET_MANAGER_ROLES), startWork);
router.patch('/:id/resolve', authenticate, authorize(ASSET_MANAGER_ROLES), resolveRequest);
```
4. In controllers, replace hardcoded `userId` test values with `req.user.id`.

---

## Phase 5 — Integrate Member 4 Utilities (After Hour 2 checkpoint)

> **Goal:** Replace all `// TODO: createLog()` and `// TODO: createNotification()` placeholders with real calls.

Once Member 4 delivers utilities:
1. `git pull dev`.
2. Import utilities at top of each controller:
```javascript
import { createLog } from '../utils/createLog.js';
import { createNotification } from '../utils/createNotification.js';
```
3. Replace every `// TODO:` placeholder with the actual call using the exact signatures:
   - `createLog(userId, action, entityType, entityId, details)`
   - `createNotification(userId, title, message, type, category)`
4. Use `type` and `category` values **exactly from `SHARED_ENUMS.md`**:

| Trigger | `type` | `category` |
|---------|--------|------------|
| Booking confirmed | `BOOKING_CONFIRMED` | `BOOKINGS` |
| Booking cancelled | `BOOKING_CANCELLED` | `BOOKINGS` |
| Maintenance approved | `MAINTENANCE_APPROVED` | `APPROVALS` |
| Maintenance rejected | `MAINTENANCE_REJECTED` | `APPROVALS` |

---

## Phase 6 — Frontend: Resource Booking Page (Screen 6) (Hour 3–5)

> **Goal:** Build `pages/ResourceBooking/` — the resource selector, calendar/timeline view, booking form, and 409 conflict display.
> Work on branch: `feature/booking-calendar`

### 6.1 — Create `frontend/src/api/bookingApi.js`

```javascript
import apiClient from './authApi.js';

export const getBookings = (params) =>
  apiClient.get('/bookings', { params }).then(r => r.data);

export const createBooking = (body) =>
  apiClient.post('/bookings', body).then(r => r.data);

export const cancelBooking = (id) =>
  apiClient.patch(`/bookings/${id}/cancel`).then(r => r.data);

// Fetch bookable assets (from Member 2's endpoint)
export const getBookableAssets = () =>
  apiClient.get('/assets', { params: { isBookable: true } }).then(r => r.data);
```

> Until Member 2's `GET /assets` is live, use this mock:
```javascript
export const MOCK_BOOKABLE_ASSETS = [
  { id: 'mock-1', name: 'Conference Room B2', assetTag: 'AF-0012' },
  { id: 'mock-2', name: 'Projector A1',       assetTag: 'AF-0015' },
];
```

### 6.2 — Create `frontend/src/pages/ResourceBooking/ResourceBookingPage.jsx`

**Component structure:**
```
ResourceBookingPage
├── ResourceSelector         ← dropdown to pick a bookable asset
├── CalendarView             ← shows existing bookings for selected asset/date
├── BookingForm              ← start time, end time, purpose inputs
└── ConflictBanner           ← shown only on 409 error
```

**State variables:**
```javascript
const [selectedAsset, setSelectedAsset] = useState(null);
const [bookings, setBookings]           = useState([]);
const [selectedDate, setSelectedDate]   = useState(new Date());
const [form, setForm]                   = useState({ startTime: '', endTime: '', purpose: '' });
const [conflict, setConflict]           = useState(null);  // null = no conflict
const [loading, setLoading]             = useState(false);
const [error, setError]                 = useState(null);
```

**On asset select:** call `getBookings({ assetId, date })` to populate `CalendarView`.

**On form submit:**
```javascript
try {
  setLoading(true);
  setConflict(null);
  await createBooking({ assetId: selectedAsset.id, startTime, endTime, purpose });
  // success: refresh bookings, clear form
} catch (err) {
  if (err.response?.status === 409) {
    setConflict(err.response.data.error.details.conflictingBooking);
  } else {
    setError(err.response?.data?.error?.message || 'Something went wrong');
  }
} finally {
  setLoading(false);
}
```

### 6.3 — CalendarView Component

**Option A (simpler — preferred for hackathon):** Custom CSS grid calendar showing time slots 8:00–20:00 for the selected date. Existing bookings are rendered as colored blocks. No external library needed.

**Option B:** `react-big-calendar` — only use if time permits and the custom grid is too complex.

**CalendarView displays:**
- Time slots on Y axis (8:00 AM – 8:00 PM)
- Existing bookings as colored blocks with tooltip: `"Priya Shah — 9:00–10:00 — Team sync"`
- Current time marker (red line)

### 6.4 — ConflictBanner Component

Shown when `conflict` state is not null:
```
⚠️ Requested 9:30 to 10:30 — slot unavailable
   Existing booking: Priya Shah — 9:00 to 10:00 (Procurement Team)
```

Styled in red/amber. Dismissed when user changes the time slot.

### 6.5 — Register Route in `App.jsx`

Add via PR to Member 1's `App.jsx`:
```jsx
import ResourceBookingPage from './pages/ResourceBooking/ResourceBookingPage';
// ...
<Route path="/booking" element={<ResourceBookingPage />} />
```

### Phase 6 Verification (Frontend)
- [ ] Bookable asset dropdown populates (mock or live)
- [ ] Calendar shows existing bookings for the selected date
- [ ] Submitting a valid slot creates a booking and refreshes the calendar
- [ ] Submitting an overlapping slot shows the `ConflictBanner` with the conflicting booking details
- [ ] Cancel button on a booking card works

---

## Phase 7 — Frontend: Maintenance Kanban Page (Screen 7) (Hour 3.5–5.5)

> **Goal:** Build `pages/Maintenance/` — the Kanban board with 5 columns and action buttons.
> Work on branch: `feature/maintenance-kanban`

### 7.1 — Create `frontend/src/api/maintenanceApi.js`

```javascript
import apiClient from './authApi.js';

export const getMaintenanceRequests = (params) =>
  apiClient.get('/maintenance-requests', { params }).then(r => r.data);

export const createMaintenanceRequest = (body) =>
  apiClient.post('/maintenance-requests', body).then(r => r.data);

export const approveRequest = (id) =>
  apiClient.patch(`/maintenance-requests/${id}/approve`).then(r => r.data);

export const rejectRequest = (id, reason) =>
  apiClient.patch(`/maintenance-requests/${id}/reject`, { reason }).then(r => r.data);

export const assignTechnician = (id, technicianId) =>
  apiClient.patch(`/maintenance-requests/${id}/assign`, { technicianId }).then(r => r.data);

export const startWork = (id) =>
  apiClient.patch(`/maintenance-requests/${id}/start`).then(r => r.data);

export const resolveRequest = (id, resolvedNotes) =>
  apiClient.patch(`/maintenance-requests/${id}/resolve`, { resolvedNotes }).then(r => r.data);
```

### 7.2 — Kanban Board Layout

**5 columns mapping to `MaintenanceStatus` enum values:**

| Column Title | Status Value | Card Actions |
|---|---|---|
| Pending | `PENDING_APPROVAL` | ✅ Approve / ❌ Reject |
| Approved | `APPROVED` | 👤 Assign Technician |
| Technician Assigned | `TECHNICIAN_ASSIGNED` | ▶ Start Work |
| In Progress | `IN_PROGRESS` | ✅ Resolve |
| Resolved | `RESOLVED` | (view only) |

> [!IMPORTANT]
> Per TECH_STACK_FREEZE.md: **NO drag-and-drop libraries**. Cards move between columns by button clicks that call the API, then re-fetch the board state. This is the approved approach.

### 7.3 — Create `frontend/src/pages/Maintenance/MaintenancePage.jsx`

**Component structure:**
```
MaintenancePage
├── RaiseRequestModal        ← triggered by "+ Raise Request" button
├── KanbanBoard
│   ├── KanbanColumn (Pending)
│   │   └── MaintenanceCard[]
│   ├── KanbanColumn (Approved)
│   │   └── MaintenanceCard[]
│   ├── KanbanColumn (Technician Assigned)
│   │   └── MaintenanceCard[]
│   ├── KanbanColumn (In Progress)
│   │   └── MaintenanceCard[]
│   └── KanbanColumn (Resolved)
│       └── MaintenanceCard[]
└── AssignTechnicianModal    ← opens when "Assign Technician" clicked
```

**State:**
```javascript
const [requests, setRequests]         = useState([]);
const [loading, setLoading]           = useState(false);
const [showRaiseForm, setShowRaiseForm] = useState(false);
const [assignTarget, setAssignTarget] = useState(null); // request to assign
const [resolveTarget, setResolveTarget] = useState(null);
```

**Data fetch on mount:**
```javascript
useEffect(() => {
  getMaintenanceRequests().then(res => setRequests(res.data));
}, []);
```

**Group requests by status:**
```javascript
const COLUMNS = ['PENDING_APPROVAL', 'APPROVED', 'TECHNICIAN_ASSIGNED', 'IN_PROGRESS', 'RESOLVED'];
const grouped = COLUMNS.reduce((acc, status) => {
  acc[status] = requests.filter(r => r.status === status);
  return acc;
}, {});
```

### 7.4 — MaintenanceCard Component

Each card shows:
- Asset tag + name (e.g., `AF-0012 — Dell Laptop`)
- Issue description (truncated to 2 lines)
- Priority badge: `LOW` (gray) | `MEDIUM` (yellow) | `HIGH` (orange) | `CRITICAL` (red)
- Requester name
- Technician name (if assigned)
- Action button(s) based on status (see table above)

**Action handler pattern (same for all):**
```javascript
const handleApprove = async (id) => {
  try {
    await approveRequest(id);
    // re-fetch the board
    const res = await getMaintenanceRequests();
    setRequests(res.data);
  } catch (err) {
    // show error toast
  }
};
```

### 7.5 — RaiseRequestModal Component

Form fields:
- **Asset** — dropdown from `GET /assets` (mock until Member 2 delivers)
- **Issue Description** — textarea
- **Priority** — dropdown: `LOW | MEDIUM | HIGH | CRITICAL` (from SHARED_ENUMS.md)
- **Photo URL** — text input (per ACCEPTANCE_CRITERIA.md: no actual file upload needed)

On submit: calls `createMaintenanceRequest()`, closes modal, refreshes board.

### 7.6 — AssignTechnicianModal Component

- Shows a dropdown of all users (can call `GET /users` for active employees)
- On submit: calls `assignTechnician(requestId, technicianId)`, refreshes board.

### 7.7 — ResolveModal Component

- Textarea for `resolvedNotes`
- On submit: calls `resolveRequest(id, resolvedNotes)`, refreshes board.

### Phase 7 Verification (Frontend)
- [ ] All 5 Kanban columns render (empty columns show a placeholder)
- [ ] "+ Raise Request" opens modal, submitting creates a card in "Pending" column
- [ ] "Approve" button moves card from Pending → Approved
- [ ] "Reject" button removes card from board
- [ ] "Assign Technician" button opens modal and moves card to Technician Assigned
- [ ] "Start Work" moves card to In Progress
- [ ] "Resolve" opens modal for notes and moves card to Resolved
- [ ] Priority badge colors match: CRITICAL=red, HIGH=orange, MEDIUM=yellow, LOW=gray

---

## Phase 8 — Wire Up DashboardLayout (After Member 1 Hour 2 checkpoint)

> **Goal:** Wrap your pages inside Member 1's `DashboardLayout.jsx` once it's available.

Once Member 1 delivers `DashboardLayout.jsx`:
1. Pull `dev`.
2. Wrap your pages:
```jsx
// ResourceBookingPage.jsx
import DashboardLayout from '../../layouts/DashboardLayout';

export default function ResourceBookingPage() {
  return (
    <DashboardLayout>
      {/* your existing JSX */}
    </DashboardLayout>
  );
}
```
3. The sidebar navigation items for "Resource Booking" (→ `/booking`) and "Maintenance" (→ `/maintenance`) should already be wired in `DashboardLayout.jsx` by Member 1 — verify with them.

---

## Phase 9 — Integration & Booking Status Transitions (Hour 5.5–6.5)

> **Goal:** Integrate with live APIs, implement status auto-transitions for bookings.

### 9.1 — Replace mocks with live APIs
- Replace `MOCK_BOOKABLE_ASSETS` with live `GET /assets?isBookable=true` call once Member 2's endpoint is available.
- Replace any test `userId` in controllers with `req.user.id` from auth middleware.

### 9.2 — Booking Status Auto-Transitions

Per `WORKFLOW.md` Section 6 and Section 11, bookings auto-transition based on time:
- `UPCOMING → ONGOING` when `startTime ≤ now() < endTime`
- `ONGOING → COMPLETED` when `now() ≥ endTime`

**Implementation approach (frontend-side, simplest for hackathon):**

In `ResourceBookingPage.jsx`, on page load and every 60 seconds, check bookings and call an update if status needs to change — OR —

Add a helper in `getBookings` controller that computes effective status:
```javascript
// In controller, after fetching bookings:
const now = new Date();
const withEffectiveStatus = bookings.map(b => {
  if (b.status === 'UPCOMING' && now >= b.startTime && now < b.endTime)
    return { ...b, status: 'ONGOING' };
  if (b.status === 'ONGOING' && now >= b.endTime)
    return { ...b, status: 'COMPLETED' };
  return b;
});
```
> This is a read-only computed status for display purposes. For the hackathon, you don't need to write these back to the DB unless time permits.

---

## Phase 10 — Polish & Demo Prep (Hour 6.5–7)

### Checklist: Must-Have Acceptance Criteria for Screen 6

From `ACCEPTANCE_CRITERIA.md`:
- [ ] Employee can book a shared resource (`isBookable: true`) by selecting a time slot
- [ ] Backend rejects overlapping bookings with `409` and conflict details
- [ ] Calendar/timeline view shows existing bookings for the selected resource

### Checklist: Must-Have Acceptance Criteria for Screen 7

From `ACCEPTANCE_CRITERIA.md`:
- [ ] Any user can raise a maintenance request with issue description and priority
- [ ] Asset Manager can approve → asset status auto-changes to `UNDER_MAINTENANCE`
- [ ] Asset Manager can assign a technician and start the work
- [ ] Resolving the request auto-changes asset status back to `AVAILABLE`
- [ ] Maintenance requests displayed as a Kanban board (5 columns)

### Demo Script: Act 3 (Member 3's part)

Practice this flow:
1. Login as Employee
2. Navigate to Resource Booking (Screen 6)
3. Select "Conference Room B2"
4. Book for **9:00–10:00** → show calendar reflecting booking
5. Try to book same room for **9:30–10:30** → show ConflictBanner
6. Navigate to Maintenance (Screen 7)
7. Click "Raise Request" → select "Dell Laptop AF-0012" → issue: "Screen flickering" → priority: HIGH → submit
8. **Switch login to Asset Manager**
9. See the card in "Pending" column → click "Approve"
10. Show that asset status changed to `UNDER_MAINTENANCE` (verify on Asset Directory if available)
11. Assign technician → Start work → Resolve (enter notes)
12. Show card in "Resolved" column and asset back to `AVAILABLE`

---

## File Delivery Summary

### Backend Files (Member 3 creates)

| File | Status |
|------|--------|
| `backend/src/routes/booking.routes.js` | CREATE |
| `backend/src/controllers/booking.controller.js` | CREATE |
| `backend/src/routes/maintenance.routes.js` | CREATE |
| `backend/src/controllers/maintenance.controller.js` | CREATE |

### Frontend Files (Member 3 creates)

| File | Status |
|------|--------|
| `frontend/src/api/bookingApi.js` | CREATE |
| `frontend/src/api/maintenanceApi.js` | CREATE |
| `frontend/src/pages/ResourceBooking/ResourceBookingPage.jsx` | CREATE |
| `frontend/src/pages/Maintenance/MaintenancePage.jsx` | CREATE |

### Shared Files (Member 3 edits via PR / coordination)

| File | Action |
|------|--------|
| `backend/server.js` | Add 2 route registrations (coordinate with Member 1) |
| `frontend/src/App.jsx` | Add `/booking` and `/maintenance` routes (via PR) |

---

## Git Branch & Commit Plan

```
feature/booking-calendar
  [BOOKING] Add booking.routes.js and booking.controller.js skeleton
  [BOOKING] Implement overlap validation in createBooking controller
  [BOOKING] Add cancelBooking controller
  [BOOKING] Wire auth.middleware after Member 1 delivers
  [BOOKING] Wire createLog + createNotification after Member 4 delivers
  [UI] Build ResourceBookingPage with asset selector and calendar view
  [UI] Build ConflictBanner component for 409 overlap display
  [UI] Add /booking route to App.jsx

feature/maintenance-kanban
  [MAINT] Add maintenance.routes.js and maintenance.controller.js skeleton
  [MAINT] Implement approve controller with asset UNDER_MAINTENANCE update
  [MAINT] Implement resolve controller with asset AVAILABLE revert
  [MAINT] Add assign, start controllers
  [MAINT] Wire auth.middleware after Member 1 delivers
  [MAINT] Wire createLog + createNotification after Member 4 delivers
  [UI] Build MaintenancePage with 5-column Kanban board
  [UI] Build RaiseRequestModal, AssignTechnicianModal, ResolveModal
  [UI] Add /maintenance route to App.jsx
```

---

## Open Questions / Assumptions

1. **No DashboardLayout yet** — build pages as standalone full-page components initially. Wrap in `DashboardLayout` once Member 1 delivers it.
2. **Calendar library** — defaulting to **custom CSS grid** (no library needed). If it becomes complex, use `react-big-calendar` as fallback.
3. **`GET /users` for technician dropdown** — this is Member 1's endpoint. Coordinate with them or mock it initially.
4. **`cancelBooking` permission** — plan is: owner OR Asset Manager / Admin can cancel. Confirm with team if this is acceptable.
5. **ONGOING/COMPLETED transitions** — treating as computed display-only status in `getBookings` response for hackathon simplicity. No background job needed.

---

## Verification Plan

### Automated Test Commands
```bash
# Test booking overlap (from backend/ dir)
curl -X POST http://localhost:5000/api/v1/bookings \
  -H "Content-Type: application/json" \
  -d '{"assetId":"<id>","startTime":"2026-07-12T09:00:00Z","endTime":"2026-07-12T10:00:00Z","purpose":"Meeting"}'

# Test overlap rejection
curl -X POST http://localhost:5000/api/v1/bookings \
  -H "Content-Type: application/json" \
  -d '{"assetId":"<id>","startTime":"2026-07-12T09:30:00Z","endTime":"2026-07-12T10:30:00Z","purpose":"Overlap test"}'
# → Must return 409 with conflictingBooking details

# Test maintenance approve (asset status change)
curl -X PATCH http://localhost:5000/api/v1/maintenance-requests/<id>/approve
# Then verify: curl http://localhost:5000/api/v1/assets/<assetId>
# → asset.status must be UNDER_MAINTENANCE

# Test maintenance resolve (asset revert)
curl -X PATCH http://localhost:5000/api/v1/maintenance-requests/<id>/resolve \
  -d '{"resolvedNotes":"Fixed the issue"}'
# → asset.status must be AVAILABLE
```

### Manual UI Verification
1. Open Screen 6 in browser → select asset → view calendar → submit booking → see conflict on double-book
2. Open Screen 7 → raise request → see card in Pending column → approve → verify card moves to Approved → assign technician → start → resolve → see card in Resolved

