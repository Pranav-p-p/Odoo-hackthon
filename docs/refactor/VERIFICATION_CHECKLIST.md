# AssetFlow — Verification Checklist

How to confirm an issue is *actually* fixed, not just "code changed and looks right." An item only moves to `Verified` in `FIX_TRACKER.md` after every box below it is checked.

Dev servers (per `vite.config.js`): frontend `:5173`, backend `:5000`, frontend proxies `/api` → backend.

---

## Screen 1 — Login / Signup (active scope — full detail)

### S1-1 — Forgot password
- [ ] Navigating to `/forgot-password` directly (typed URL) renders a real page — does **not** bounce to `/login`.
- [ ] Clicking "Forgot password?" on `/login` lands on that same page.
- [ ] Page has an email field + submit button, visually consistent with `LoginPage`/`RegisterPage` (dark canvas `#010102`, surface-1 card `#0f1011`, same brand mark, Inter font, `btn-primary` submit).
- [ ] Submitting a **real, seeded** user's email calls `POST /auth/forgot-password` (check Network tab) and shows a generic success message.
- [ ] Submitting a **non-existent** email shows the **identical** message (byte-for-byte the same UI state) — this is the point of the endpoint; if the two cases differ in any visible way, it's not done.
- [ ] A "Back to login" link is present and works.
- [ ] No console errors on load or submit.
- [ ] Loading/disabled state on the submit button while the request is in flight (match the pattern in `LoginPage.jsx`'s `isLoading`).

### S1-2 — Register → Dashboard
- [ ] First, confirm via the actual `auth.routes.js` signup handler (not assumption) whether the response includes a token + user object.
- [ ] If it does: after successful signup, the user lands on `/dashboard` already authenticated — `localStorage`/`sessionStorage` has the token, `DashboardLayout` renders, no forced re-login, refreshing `/dashboard` doesn't kick them out.
- [ ] If it doesn't: do **not** silently add token issuance to the signup endpoint as a side effect of a "Screen 1 UI fix" — that's a backend contract change. Stop and flag it in `diff.md` as a deviation requiring a decision, rather than shipping an undiscussed backend change.
- [ ] Existing behavior (signup → redirect to `/login`) must not regress while this is being decided — don't leave the app in a broken intermediate state.

---

## Backlog screens (concise criteria — flesh out when that screen becomes active scope)

### Root causes
- **ROOT-1:** Register an asset, allocate it, return it, approve a transfer, create+verify+close an audit cycle — all 6 actions return a success response (not 500) *and* a corresponding `ActivityLog`/`Notification` row exists in the DB for each. Booking and Maintenance actions (already correct) must still work identically after the change — regression-check them too.
- **ROOT-2:** Log in **without** "Remember me," then open `AllocationTransferPage` as an Asset Manager/Admin — "Pending Transfers" tab must render and fetch data. Repeat with "Remember me" checked — same result both ways.

### Screen 2 — Dashboard
- S2-1: A maintenance request `APPROVED`/`TECHNICIAN_ASSIGNED`/`IN_PROGRESS` today but *created* yesterday counts toward "Maintenance Today"; one created today but already `RESOLVED` last week does not.
- S2-2/S2-3: Confirm the final formula against `WORKFLOW.md` with the person before changing — these are product-decision items, not pure bugs. If keeping a cap/window, document it in `docs/WORKFLOW.md` so it stops being "undocumented."
- S2-3: A booking whose time window is currently in progress shows up in "Active Bookings" without requiring a page reload timed exactly right — verify the transition mechanism actually runs (cron/on-read reconciliation that writes back), not just that the query includes `UPCOMING`.
- S2-4: Dashboard Quick Actions are Register Asset / Book Resource / Raise Maintenance Request, each navigating to (or opening) the correct flow.

### Screen 3 — Organization Setup
- S3-1: Admin can edit an existing department's name/head/parent and toggle its status from the Departments tab; list reflects the change without a manual refresh.
- S3-2: Head/Parent Department are searchable pickers (name-based), not raw text UUID fields.
- S3-3/S3-4: Admin can edit an existing category's name/description; a PATCH with only `description` (no `name`) succeeds.

### Screen 4 — Asset Registration & Directory
- S4-1: Covered by ROOT-1 verification above.
- S4-2: A non-status field can still be edited via `PATCH /assets/:id`; `status` in the same payload is either rejected or ignored (confirm which behavior is intended before implementing, then match the comment to the code either way).

### Screen 5 — Allocation & Transfer
- S5-1/S5-2: Covered by ROOT-1 verification above.
- S5-3: Covered by ROOT-2 verification above.

### Screen 6 — Resource Booking
- S6-1: Purpose field and Confirm Booking button visually match the dark-canvas inline-style pattern used by the rest of the page (no light backgrounds/blue Tailwind defaults).
- S6-2: With zero real bookable assets in the DB, the picker shows an empty/"no resources" state instead of fake rooms — or, if the fallback is kept intentionally for demo purposes, it's behind an explicit flag, not silent.
- S6-3: `startTime < endTime` custom validator either fires correctly when wired into `validate()`, or is removed if the controller's inline check is being kept as the sole source of truth — don't leave dead code either way.

### Screen 7 — Maintenance
- S7-1: Assign Technician modal lists real users from `GET /users` (or the correct live endpoint), assigning one succeeds end-to-end (Kanban card moves to "Technician Assigned" with the real technician's name shown).

### Screen 8 — Asset Audit
- S8-1: Create an audit cycle, verify an item, close a cycle — all three return success (not 500) and reflect in the UI without needing a manual refresh to "discover" the change already happened.
- S8-2: Every handler on `AuditPage.jsx` shows a visible error message on failure (network error, permission error, etc.), not just a console log.
- S8-3: Confirm with the person whether multi-auditor support is in scope before starting — this is a schema migration, not a quick patch. If deferred, mark `Deferred` in the tracker with that reasoning, don't leave it silently `Not Started` forever.

### Screen 9 — Reports & Analytics
- S9-1/S9-2: Maintenance Frequency and Department Allocation Summary each have a visible panel on `ReportsPage.jsx` populated with real data (not just fetched into an unused variable).

### Screen 10 — Activity Logs & Notifications
- S10-1: Covered by ROOT-1 verification above.
- S10-2: Creating/editing a department, category, or promoting a user produces a visible entry in the Activity Log.

### Cross-cutting
- X-1: `/components-test` either removed from `App.jsx` or wrapped in the same `ProtectedRoute`/dev-only guard as the rest of the app.
- X-2: `App.css` no longer contains unreferenced default-Vite selectors.
- X-3: Informational only — no verification needed unless a restructuring task is explicitly requested.
- X-4: Confirm via `prisma/migrations/*.sql` whether `fn_prevent_double_allocation` exists; document the answer in `ISSUES.md`'s "Still unverifiable" section either way (move it out of that section once resolved).
