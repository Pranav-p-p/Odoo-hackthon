# Role Distribution & Team Work Split

To ensure zero merge conflicts and parallel development, the 4-person team is assigned highly isolated vertical slices (Full-stack: DB + Express + React).

---

## Member 1: Identity & Foundation
**Focus:** Authentication, Organization structure, and Role Management.
*   **Backend:**
    *   Auth endpoints (`/auth/login`, `/auth/signup`).
    *   JWT generation and validation middleware.
    *   Department CRUD and Category CRUD.
    *   Employee directory & Role update endpoint.
*   **Frontend:**
    *   Login & Signup screens.
    *   Admin Settings view (Tabs for Departments, Categories, Employees).
    *   Global state/context for `currentUser`.
*   **Handoff Point:** Once JWT and `req.user` middleware is working, inform the rest of the team to use it on their protected routes.

---

## Member 2: Asset Core
**Focus:** Asset directory, Lifecycle management, Allocations, and Transfers.
*   **Backend:**
    *   Asset CRUD (`/assets`).
    *   Allocation endpoints (`/allocations`).
    *   Transfer approval logic (`/transfers`).
    *   Validation logic preventing double-allocation of `AVAILABLE` assets.
*   **Frontend:**
    *   Asset Registration Form.
    *   Asset Directory grid/table (with filters).
    *   Asset Detail page showing Allocation history.
    *   Transfer Request Modals.
*   **Handoff Point:** Ensure the `Asset` table schema is finalized early so Member 3 and 4 can link Foreign Keys to `assetId`.

---

## Member 3: Operations
**Focus:** Resource Booking and Maintenance workflows.
*   **Backend:**
    *   Booking endpoints with date/time overlap validation.
    *   Maintenance request endpoints.
    *   Logic to auto-update Asset status to `UNDER_MAINTENANCE` upon approval.
*   **Frontend:**
    *   Calendar view for `isBookable` assets.
    *   Booking modal.
    *   Maintenance dashboard (Kanban or list view for Pending, Approved, Resolved).
*   **Handoff Point:** Rely on Member 2's Asset list to populate dropdowns for "Select Asset for Maintenance".

---

## Member 4: Intelligence
**Focus:** Audits, KPIs, Logs, and Notifications.
*   **Backend:**
    *   Audit Cycle creation and Item verification endpoints.
    *   `/dashboard/kpi` aggregate endpoints.
    *   Notification generation utility.
    *   Activity Log insertion utility.
*   **Frontend:**
    *   Home Dashboard layout (KPI cards).
    *   Audit execution interface for Auditors.
    *   Notification drawer (Top nav bar).
    *   Activity Log table.
*   **Handoff Point:** Provide a simple `createLog()` function on the backend that Members 1, 2, and 3 can call inside their controllers to populate the activity feed.

---

## Integration Checkpoints
1.  **Hour 1:** Prisma Schema finalized and migrated by one person. Everyone pulls the updated schema.
2.  **Hour 3:** Member 1 finishes Auth. All other members integrate the Auth middleware to protect their routes.
3.  **Hour 6:** Core APIs done. UI integration begins.
4.  **Hour 7.5:** Final build, cross-module testing (e.g., Check if booking an asset updates the dashboard KPIs).
