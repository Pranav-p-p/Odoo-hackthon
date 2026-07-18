# AssetFlow — Known Issues (Source of Truth)

**Generated:** 2026-07-15, from a full static line-by-line audit of the flattened codebase (18,614 lines — backend + frontend + team docs) cross-checked against the original problem statement and the real `schema.prisma`.
**Nature of this document:** every item below is grounded in a specific file/function I actually read. Nothing here is inferred from the team's own tracker docs — `docs/IMPLEMENTATION_TRACKER.md` in the repo is stale and contains an unresolved merge conflict; treat it as historical color, not status.

## Project snapshot
- 4-person, 8-hour hackathon build. React 18 + Vite + Tailwind (dark-canvas custom design system, inline styles) frontend; Node/Express + Prisma + PostgreSQL (Supabase) backend.
- Member split: M1 = Identity/Foundation (auth, layout, org setup, users), M2 = Asset Core (assets, allocation, transfer), M3 = Operations (booking, maintenance), M4 = Intelligence (dashboard, audit, reports, notifications, activity log).
- Most bugs below trace back to M2/M3/M4 code being written in parallel against a shared-utility contract that wasn't finalized until late, then never reconciled after the fact.

## How to use this file
1. This is the **canonical** list. IDs (`ROOT-#`, `S<n>-#`, `X-#`) are stable — never renumber. If an issue turns out invalid on inspection, mark it "Not Reproducible" in `FIX_TRACKER.md` with a reason; don't delete it here.
2. Work one screen at a time (see `FIX_TRACKER.md` for current scope). Don't fix issues outside the active screen even if you trip over them — log them as noticed in `diff.md` instead so they aren't lost.
3. Before marking anything "Fixed," it must pass its entry in `VERIFICATION_CHECKLIST.md`.
4. Every change gets an entry in `diff.md`, referencing the issue ID.

## Legend
✅ Working as intended, matches spec — no action needed
⚠️ Partial — works but deviates from spec, or is a lower-severity/cleanup item
❌ Broken or missing — needs a fix

---

## ROOT CAUSE BUGS
*(Not tied to one screen — fixing these unblocks multiple screens at once. Full detail here; screens below just reference the ID.)*

### ROOT-1 ❌ `createLog`/`createNotification` calling-convention mismatch
**Files:** `backend/src/utils/createLog.js`, `backend/src/utils/createNotification.js` (the actual implementations) vs. callers in `allocation.controller.js`, `asset.controller.js`, `transfer.controller.js`, `audit.service.js`.

The real implementations take **one destructured object, and require the caller to pass in `prisma`**:
```js
const createLog = async ({ prisma, userId, action, entityType, entityId, details }) => {...}
const createNotification = async ({ prisma, userId, title, message, type, category }) => {...}
```
- **Correct callers** (object + `prisma`, matches the real signature): `booking.controller.js`, `maintenance.controller.js`. These work.
- **Broken — positional args**: `allocation.controller.js` (`createAllocation`, `returnAllocation`), `asset.controller.js` (`createAsset`, `updateAsset`), `transfer.controller.js` (`approveTransfer`, `rejectTransfer`). Positional call → `prisma` destructures as `undefined` → `TypeError` inside the util → bubbles up as a 500.
- **Broken — object shape right, `prisma` key omitted**: all 4 call sites in `audit.service.js` (`createAuditService`, `verifyItemService`, `closeAuditCycleService` ×2). Same crash, different cause.

**Impact:** in every broken case, the actual DB write (the asset, the allocation, the transfer approval, the audit cycle) **already succeeded** before the crash. Users see a false failure (500 / red error toast) for an action that actually worked. Confirmed concretely: submitting the asset registration form creates the asset but shows "Failed to register asset."

**Downstream:** ActivityLog rows and Notifications for `ASSET_REGISTERED`, `ASSET_ASSIGNED`, `TRANSFER_APPROVED/REJECTED`, and all `AUDIT_*` events are never created (the crash happens on the DB-write line inside the util itself). Notifications inbox and Dashboard "Recent Activity" will look sparse even after the crash is fixed, unless this is fixed too.

**Fix direction:** standardize on one convention. Cheapest: update the 8 broken call sites to pass a single object including `prisma`, since more files (booking + maintenance) already do it that way.

**Affects:** S4-1, S5-1, S5-2, S8-1, S10-1.

### ROOT-2 ❌ Four independent "read current user" implementations, two broken
1. `context/AuthContext.jsx` — checks `localStorage` **and** `sessionStorage`. Correct. Used by DashboardLayout, LoginPage, OrganizationSetupPage.
2. `hooks/useCurrentUser.js` — also checks both correctly, but its own code comment admits it's a temporary stand-in for `AuthContext` that was supposed to be deleted once `AuthContext` landed — it never was. Used by `AssetDirectory.jsx`.
3. Inline `getCurrentUser()` defined directly inside `AllocationTransferPage.jsx` — **`localStorage` only.**
4. `components/Assets/components/RoleGate.jsx` — **`localStorage` only.**

**Impact (confirmed reproducible):** if a user logs in without checking "Remember me" (token goes to `sessionStorage` per `AuthContext.login(token,user,remember)`), then on `AllocationTransferPage.jsx`, `isManager = canManage(getCurrentUser())` evaluates against `null`. The "Pending Transfers" tab doesn't render and transfer data isn't fetched — a legitimately logged-in Asset Manager/Admin cannot reach the transfer-approval UI at all.

**Fix direction:** delete implementations 2, 3, 4. Use `useAuth()` everywhere.

**Affects:** S5-3.

---

## Screen 1 — Login / Signup
### S1-1 ❌ "Forgot password" is a dead link
**Files:** `frontend/src/pages/Login/LoginPage.jsx`, `frontend/src/App.jsx`
LoginPage links to `/forgot-password`. No such route exists in `App.jsx`'s `<Routes>` — it falls through to the catch-all (`<Route path="*" element={<Navigate to="/login" replace />} />`) and silently bounces back to `/login`. Backend is fine: `POST /auth/forgot-password` exists in `auth.routes.js` and returns a generic success response regardless of whether the email exists (correct — prevents user enumeration). There is simply no frontend page that calls it.
**Priority:** High — explicit spec requirement (Screen 1: "forgot password"), currently a dead link in a shipped screen.

### S1-2 ⚠️ Register redirects to `/login` instead of auto-login to Dashboard
**File:** `frontend/src/pages/Register/RegisterPage.jsx`
`handleSubmit` calls `navigate('/login', { replace: true })` after a successful `POST /auth/signup`. `docs/WORKFLOW.md` describes the intended flow as auto-login straight to `/dashboard`. Known, previously accepted as low-priority/demo-acceptable in the team's own tracker.
**Priority:** Low — cosmetic UX gap, not a spec-breaking bug. Verify whether `/auth/signup`'s response actually includes a token before assuming this is a pure frontend fix — if it doesn't, this becomes a backend change too.

### S1-3 ✅ Signup — Employee-only, no self-elevation
`auth.routes.js` — matches spec exactly. No action needed.

### S1-4 ✅ Login — bcrypt check, JWT issue, inactive users rejected (403)
Verified in `auth.middleware.js` + `auth.routes.js`. No action needed.

### S1-5 ✅ JWT interceptor reads both storage types
`authApi.js` checks `localStorage` and `sessionStorage` for the token. No action needed (this was a previously tracked issue that is genuinely resolved).

---

## Screen 2 — Dashboard
### S2-1 ⚠️ "Maintenance Today" KPI formula deviates from spec
**File:** `backend/src/services/dashboard.service.js` / `dashboard.repository.js`
Counts `MaintenanceRequest` rows *created* today, any status. Spec (`WORKFLOW.md`) wants rows with status in `(APPROVED, TECHNICIAN_ASSIGNED, IN_PROGRESS)` *updated* today — a different, more operationally-relevant number.
**Priority:** Medium.

### S2-2 ⚠️ "Upcoming Returns" KPI has an undocumented 7-day cap
Query adds `expectedReturn: { lte: sevenDaysFromNow }`. Spec formula is just `expectedReturn > now()`, no upper bound. Not necessarily wrong as a product decision, but undocumented and will under-count relative to the written spec.
**Priority:** Low-Medium.

### S2-3 ❌ "Active Bookings" KPI is effectively always 0
Two compounding problems: (1) the query only checks `status: 'ONGOING'`, spec wants `UPCOMING` **or** `ONGOING`; (2) nothing anywhere in the codebase ever transitions a booking's *persisted* `status` from `UPCOMING` → `ONGOING` — there's no cron/scheduled job (`WORKFLOW.md` describes one; it doesn't exist in code), so the raw DB value stays `UPCOMING` until manually cancelled. Even fixing (1) alone won't fix the KPI without (2).
**Priority:** Medium-High — visibly wrong number on the primary dashboard.

### S2-4 ❌ Quick Actions don't match spec
**File:** `frontend/src/pages/Dashboard/DashboardPage.jsx`
Spec (Screen 2): "Quick actions: Register Asset, Book Resource, Raise Maintenance Request." Actual: links to Audit Cycles / Reports / Notifications.
**Priority:** Low-Medium — easy fix, but a direct spec mismatch.

---

## Screen 3 — Organization Setup
### S3-1 ❌ Department edit/deactivate has no UI
**File:** `frontend/src/pages/OrganizationSetup/OrganizationSetupPage.jsx` (`DepartmentsTab`)
Only a create modal exists. Backend `PATCH /departments/:id` (including `status` toggle) is fully implemented and unused by the frontend.
**Priority:** Medium-High — explicit spec requirement ("Create/edit/deactivate department").

### S3-2 ⚠️ Department Head / Parent Department are raw UUID text fields
Same tab: "Head User ID" and "Parent Dept ID" are plain `<input type="text">` fields requiring a hand-typed UUID. No realistic admin knows a user's UUID. Technically wired to the API, practically unusable.
**Priority:** Medium — blocks real-world use of a named requirement even though the API path works.

### S3-3 ❌ Category edit has no UI
**File:** same page (`CategoriesTab`)
Create-only, same pattern as S3-1. Backend `PATCH /categories/:id` exists and is unused. (Deactivation is *not* a gap — `AssetCategory` has no status field in `schema.prisma`, and the spec never asks for it — only "Create/edit categories.")
**Priority:** Medium.

### S3-4 ⚠️ `PATCH /categories/:id` reuses the `createCategory` validation schema
**File:** `backend/src/middleware/validate.middleware.js`, `backend/src/routes/category.routes.js`
`createCategory` schema marks `name` as `required: true` and is passed to `validate()` for both POST and PATCH. A partial update sending only `{ description }` would fail with "name is required." Currently latent (no frontend UI calls this endpoint yet — see S3-3), but will bite the moment S3-3 is fixed unless corrected at the same time.
**Priority:** Low now, but fix alongside S3-3, not after.

### S3-5 ✅ Employee Directory — role/status promotion
Search, role dropdown (Employee/Asset Manager/Department Head, correctly excludes self-promotion to Admin), status toggle, self-edit protection (can't edit your own row) — all correctly implemented and calling the right endpoints (`PATCH /users/:id/role`, `PATCH /users/:id/status`). This is the single most important requirement in Screen 3 ("only place roles are assigned") and it's solid. No action needed.

---

## Screen 4 — Asset Registration & Directory
### S4-1 ❌ Register / Update show false failure → caused by ROOT-1
`asset.controller.js`'s `createAsset` and `updateAsset` both call `createLog` positionally. See ROOT-1.
**Priority:** Critical (inherits ROOT-1's priority).

### S4-2 ⚠️ `PATCH /assets/:id` allows direct status mutation despite its own comment saying otherwise
**File:** `backend/src/controllers/asset.controller.js` (`updateAsset`)
The code comment reads: *"status is intentionally excluded... driven by allocation/maintenance/audit workflows, not direct edits."* The actual code destructures `status` from the body and applies it anyway. Any Asset Manager can force an asset's status directly via this endpoint, bypassing the state-machine integrity the rest of the app enforces (e.g., set `AVAILABLE` while still actually allocated).
**Priority:** Medium — integrity/security-adjacent, not user-facing broken, but worth closing.

### S4-3 ✅ Search/filter/pagination, auto-tag generation, per-asset history
All correctly implemented — tag/serial/QR/category/status/department/location filters, server-side `AF-XXXX` generation (client-supplied tags ignored), allocation+maintenance history per asset. No action needed.

---

## Screen 5 — Allocation & Transfer
### S5-1 ❌ Allocate (happy path) / Return show false failure → caused by ROOT-1
`allocation.controller.js`'s `createAllocation` (notification call) and `returnAllocation` (log call). See ROOT-1.
**Priority:** Critical.

### S5-2 ❌ Transfer approve/reject show false failure → caused by ROOT-1
`transfer.controller.js`'s `approveTransfer`/`rejectTransfer` (both calls). See ROOT-1.
**Priority:** Critical.

### S5-3 ❌ "Pending Transfers" tab invisible for managers without "Remember me" → caused by ROOT-2
`AllocationTransferPage.jsx`'s local `getCurrentUser()`. See ROOT-2.
**Priority:** High.

### S5-4 ✅ Double-allocation block
`allocation.controller.js` — 409, `currentHolder`, `suggestTransfer: true`, exactly per API contract. Transaction-safe. No action needed.

### S5-5 ✅ Transfer state machine
Requested → Approved → Re-allocated, history updated automatically. Correctly written. No action needed.

---

## Screen 6 — Resource Booking
### S6-1 ⚠️ Visual bug — Tailwind light-theme classes on two form elements
**File:** `frontend/src/pages/ResourceBooking/ResourceBookingPage.jsx`
The Purpose field and "Confirm Booking" button use `className="... text-gray-700 ... bg-blue-600 hover:bg-blue-700 ..."` while every other element on this page (and app-wide) uses the dark-canvas inline-style system. `tailwind.config.js`'s `content` glob does include this file, so these render as light-themed elements inside an otherwise all-dark UI.
**Priority:** Low — cosmetic, but visually jarring and easy to fix.

### S6-2 ⚠️ `getBookableAssets()` silently falls back to mock data on an empty (not just failed) real response
**File:** `frontend/src/api/bookingApi.js`
`return assets.length > 0 ? assets : MOCK_BOOKABLE_ASSETS;` — if a real deployment simply has zero bookable assets registered, fake rooms appear and any booking attempt against them will fail (fake `assetId`). Fine for demo, a landmine for real use.
**Priority:** Low-Medium.

### S6-3 ⚠️ Dead validator in `validate.middleware.js`'s `createBooking` schema
The `startTime < endTime` cross-field check is nested as a top-level schema key instead of inside a field's rule object, so `validate()` never invokes it. **No functional impact today** — `booking.routes.js` never wires `validate()` into the create-booking route at all, and the controller has its own working inline check — but it's dead/misleading code that should be fixed or removed.
**Priority:** Low — cleanup only.

### S6-4 ✅ Overlap validation, conflict banner, calendar, cancel flow
Overlap logic matches spec exactly, correct utility calls (unaffected by ROOT-1), min/max duration checks, 409 conflict UI shows the exact conflicting booking. This is the best-implemented screen in the app. No action needed.

---

## Screen 7 — Maintenance
### S7-1 ❌ "Assign Technician" is fully non-functional
**File:** `frontend/src/api/maintenanceApi.js`
`getUsers()`'s real API call is commented out with a `TODO`; the function unconditionally returns hardcoded mock users ("Rahul Verma," "Sneha Pillai"). Every technician-assignment attempt sends a fake user ID → real backend rejects with `TECHNICIAN_NOT_FOUND` (404). Backend side (`assignTechnician` in `maintenance.controller.js`) is correct and unaffected by ROOT-1.
**Priority:** High — a required workflow step is completely blocked.

### S7-2 ✅ 5-state Kanban, all transitions, per-modal error surfacing
Pending → Approved → Technician Assigned → In Progress → Resolved, plus Reject, all with correct guards. Correct utility calls (unaffected by ROOT-1). Each modal has its own visible error state — a better pattern than Screen 8 uses. No action needed beyond S7-1.

---

## Screen 8 — Asset Audit
### S8-1 ❌ Every mutating audit action crashes → caused by ROOT-1 (the "missing `prisma` key" variant)
`audit.service.js`'s `createAuditService`, `verifyItemService`, `closeAuditCycleService`. See ROOT-1. The state-machine/discrepancy logic itself is correctly written — this is purely the shared-utility crash.
**Priority:** Critical.

### S8-2 ⚠️ `AuditPage.jsx` swallows all errors silently
Every handler (`handleCreateSubmit`, `handleUpdateItem`, `handleCloseCycle`) catches with `console.error` only — no user-facing message anywhere on this page. Combined with S8-1, every action on this screen currently looks like it does *nothing* (no error, no success, modal doesn't close) even though it actually completed server-side.
**Priority:** Medium — fix alongside S8-1 so the screen gives real feedback once the crash is gone.

### S8-3 ⚠️ Schema supports exactly one auditor per cycle, not "one or more"
**Confirmed against `schema.prisma`:** `AuditCycle.auditorId` is a single scalar `String @db.Uuid` FK (many-to-one), not a join table or array. Spec (Screen 8) explicitly says "assign one or more auditors to the cycle." This is a schema-level scope reduction, not a bug — fixing it properly means a migration (join table `AuditCycleAuditor` or similar), not just an app-code change.
**Priority:** Medium — real gap, but the largest lift of any Screen 8 item; likely a deliberate scope call, confirm before touching.

---

## Screen 9 — Reports & Analytics
### S9-1 ❌ "Maintenance frequency by asset/category" is fetched but never rendered
**File:** `frontend/src/pages/Reports/ReportsPage.jsx`
`getMaintenanceFrequency()` result is stored in `_maintenance` (underscore = intentionally unused) and never appears in the JSX. Backend (`reports.service.js`) is fully correct.
**Priority:** Medium — an explicitly named Screen 9 requirement, silently missing (API call succeeds, so it won't show up as an error in testing).

### S9-2 ❌ "Department-wise allocation summary" is fetched but never rendered
Same file, same pattern: `getDepartmentAllocation()` → `_breakdown` → never rendered. Not to be confused with the "Department Utilization" panel that *is* rendered (that's a separate, already-working report, `getUtilization()`).
**Priority:** Medium.

### S9-3 ✅ Everything else
Department Utilization, Top High-Demand Assets, Idle Assets (30+ days), Proactive Maintenance (due-for-maintenance), Booking Heatmap, 4-type CSV export — all correctly implemented, backend and frontend. No action needed.

---

## Screen 10 — Activity Logs & Notifications
### S10-1 ⚠️ Notification/log data will be incomplete → caused by ROOT-1
Not a bug in this screen's own code — the inbox and activity log UIs are correct, but events from Asset/Allocation/Transfer/Audit never get created server-side (ROOT-1). Fixing ROOT-1 fixes this automatically; no separate frontend work needed.

### S10-2 ❌ Department / Category / User role-status changes never call `createLog` at all
Unlike every other module, these three admin actions don't even attempt to log — not a crash, just absent. Contrary to `WORKFLOW.md`'s "every POST/PATCH/DELETE creates an ActivityLog entry" rule.
**Priority:** Medium.

### S10-3 ✅ Notification inbox, activity log listing
Tabs by category, mark-read/mark-all-read, pagination — all correctly implemented. No action needed.

---

## Cross-Cutting / Architecture
### X-1 ❌ `/components-test` is a live, unguarded public route
**File:** `frontend/src/App.jsx`
Sits alongside `/login` and `/register`, outside `ProtectedRoute`, rendering `TestComponents.jsx` (a dev-only component showcase). Remove or gate before any real deployment/demo.
**Priority:** Medium — not a security-critical leak (no data exposure), but shouldn't ship.

### X-2 ⚠️ `App.css` has unused default-Vite boilerplate
`.hero`, `#next-steps`, etc. — dead CSS, cosmetic only.
**Priority:** Low.

### X-3 ⚠️ Architecture drift from `docs/SYSTEM_ARCHITECTURE.md`
Not functional bugs — just worth knowing before restructuring anything: `auth`, `category`, `department`, `user` routes have no dedicated controller file (logic lives inline in the route file); only 5 of 11 modules (`activityLog`, `audit`, `dashboard`, `notification`, `reports`) have a service/repository layer; no `validators/` folder or `config/env.js` exists even though the architecture doc lists them.
**Priority:** Low — informational, don't "fix" this without being asked; it's a documentation/reality mismatch, not broken behavior.

### X-4 ⚠️ No DB-level uniqueness constraint backing the double-allocation rule
`schema.prisma`'s `Allocation` model has `@@index([assetId, status])` — a performance index, not a uniqueness constraint. The double-allocation rule (S5-4) is enforced purely in application code (`allocation.controller.js`) unless the Postgres trigger referenced in a `transfer.controller.js` comment (`fn_prevent_double_allocation`) genuinely exists — see "Still Unverifiable" below.
**Priority:** Low — the app-level check is correct for normal traffic; this is a race-condition/defense-in-depth note, not an observed bug.

---

## Schema verification notes (resolved now that `schema.prisma` is available)
- `Department.status DepartmentStatus @default(ACTIVE)` confirmed — S3-1 is a frontend-only gap, backend/schema already support it.
- `AssetCategory` confirmed to have **no** status field — "deactivate category" is correctly out of scope, not a gap.
- `AuditCycle.auditorId String @db.Uuid` confirmed as a single scalar FK — S8-3 confirmed as written, not a misreading of the docs copy.
- `Booking` model has a plain `status` column with no auxiliary field for tracking scheduled transitions — confirms S2-3 needs actual application logic (cron or reconciliation-on-write), not just a schema tweak.

## Still unverifiable from provided files
- **`fn_prevent_double_allocation` Postgres trigger** (referenced in a `transfer.controller.js` comment) — lives in migration SQL, not `schema.prisma`. Check `prisma/migrations/` directly if you want X-4 fully resolved.
- `.env` contents (`DATABASE_URL`, `JWT_SECRET`, etc.) — not committed, as expected; unverified by definition.
- No build/install/test run was performed — this is a static read-through. Environment-only failures (lockfile drift, Node version mismatch) aren't covered here.
- `DESIGN.md` and raw CSS weren't reviewed line-by-line — this audit prioritized functional/business-logic correctness over pixel-level visual QA (S6-1 was caught anyway because it broke an established pattern hard enough to be obvious from the JSX alone).
