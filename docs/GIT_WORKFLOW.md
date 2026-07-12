# Git Workflow & Rules

Because this is an 8-hour hackathon, we prioritize speed and safety. Strict adherence to these rules prevents catastrophic merge conflicts.

---

## Branch Strategy

*   **`main`**: Production-ready branch. Merges from `dev` only after full integration testing.
*   **`dev`**: The primary integration branch. All feature branches merge here.
*   **Feature Branches**: Branch off `dev` using the format `feature/<module>-<description>`.
    *   *Examples:*
    *   `feature/auth-login` (Member 1)
    *   `feature/org-setup-departments` (Member 1)
    *   `feature/asset-registration` (Member 2)
    *   `feature/allocation-transfer` (Member 2)
    *   `feature/booking-calendar` (Member 3)
    *   `feature/maintenance-kanban` (Member 3)
    *   `feature/dashboard-kpi` (Member 4)
    *   `feature/audit-cycle` (Member 4)
    *   `feature/reports-analytics` (Member 4)
    *   `feature/notifications` (Member 4)

---

## Commit Message Style

Keep commits atomic and descriptive. Prefix with the module:

*   `[AUTH] Add JWT middleware validation`
*   `[ORG] Create department CRUD with hierarchy`
*   `[ASSET] Create asset POST endpoint with tag generation`
*   `[ALLOC] Add double-allocation 409 conflict response`
*   `[TRANSFER] Implement approve/reject workflow`
*   `[BOOKING] Fix overlap validation SQL query`
*   `[MAINT] Add technician assignment endpoint`
*   `[AUDIT] Generate discrepancy report on cycle close`
*   `[REPORTS] Build utilization by department endpoint`
*   `[NOTIF] Add notification category filtering`
*   `[UI] Build dashboard KPI cards`
*   `[UI] Build maintenance Kanban board`
*   `[SCHEMA] Add MaintenancePriority enum`

---

## PR / Merge Rules

1. **No direct pushes to `main` or `dev`**.
2. All feature branches must be merged into `dev` via Pull Request.
3. **Fast Reviews:** Since it's a hackathon, require exactly **1 approval** from another team member before merging. Do not block for hours.
4. Delete branches after merging.
5. **Merge strategy:** Use squash merge to keep `dev` history clean.

---

## Ownership Rules (Avoiding Conflicts)

### Backend Route Ownership

| Member | Owns (do NOT edit without talking to the owner) |
|--------|----------------------------------------------|
| Member 1 | `auth.routes.js`, `department.routes.js`, `category.routes.js`, `user.routes.js` |
| Member 2 | `asset.routes.js`, `allocation.routes.js`, `transfer.routes.js` |
| Member 3 | `booking.routes.js`, `maintenance.routes.js` |
| Member 4 | `audit.routes.js`, `dashboard.routes.js`, `report.routes.js`, `notification.routes.js`, `activityLog.routes.js` |

### Frontend Page Ownership

| Member | Owns |
|--------|------|
| Member 1 | `pages/Login/`, `pages/OrganizationSetup/`, `layouts/DashboardLayout.jsx`, `context/AuthContext.jsx` |
| Member 2 | `pages/Assets/`, `pages/AllocationTransfer/` |
| Member 3 | `pages/ResourceBooking/`, `pages/Maintenance/` |
| Member 4 | `pages/Dashboard/`, `pages/Audit/`, `pages/Reports/`, `pages/Notifications/`, `components/NotificationBell.jsx` |

### Shared Files (Coordinate Before Editing)

*   `prisma/schema.prisma` — see Prisma Schema Rules below.
*   `src/utils/createLog.js` — owned by Member 4, called by all.
*   `src/utils/createNotification.js` — owned by Member 4, called by all.
*   `App.jsx` (route definitions) — Member 1 sets up the initial routing; others add their routes via PR.
*   `api/axios.js` — Member 1 sets up; others use as-is.

---

## Prisma Schema Rules

*   The `schema.prisma` file is the **#1 source of merge conflicts**.
*   **Rule:** If you need to change `schema.prisma`, you MUST announce it to the team.
*   Only **ONE person** should push schema changes and run `npx prisma migrate dev` to generate the migration.
*   **Recommended flow:**
    1. Member 1 finalizes the full schema at Hour 0.5 (based on `DATABASE_SCHEMA.md`).
    2. All members pull `dev` and run `npx prisma generate` locally.
    3. If a schema change is needed later, announce → one person applies → push → everyone pulls and regenerates.

---

## Frontend / Backend Synchronization

*   If you change an API request/response shape, you **must update `docs/API_CONTRACT.md` immediately**.
*   Frontend developers must mock data based exactly on `API_CONTRACT.md` until the backend endpoint is ready. This allows parallel work.
*   Use the shared Axios instance (`api/axios.js`) with the JWT interceptor — never create standalone fetch calls.

---

## Integration Checkpoints (Git Actions)

| Hour | Git Action |
|------|-----------|
| 0.5 | Member 1 pushes initial project scaffold + Prisma schema to `dev`. Everyone pulls. |
| 2.0 | Member 1 merges auth branch. Member 4 merges utility functions. Everyone pulls `dev` and integrates. |
| 4.0 | All members merge their core backend branches to `dev`. Resolve any integration issues. |
| 5.5 | All members merge frontend branches to `dev`. Cross-screen navigation testing. |
| 7.0 | Feature freeze. Only bug-fix commits allowed after this. |
| 7.5 | Final merge to `main`. Tag release. |
