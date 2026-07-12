# System Architecture

## High-Level Architecture Diagram

```text
+---------------------+        +-------------------------+        +--------------------------+
|                     |  HTTP  |                         | Prisma |                          |
|   Frontend (React)  +------->+  Backend (Node+Express) +------->+   Database (Supabase)    |
|                     |  JSON  |                         |        |                          |
| - Dashboard UI      +<-------+ - JWT Auth Middleware   +<-------+ - PostgreSQL DB          |
| - Forms & Lists     |        | - Business Logic Routes |        | - Relational Data        |
| - Role-based views  |        | - Role Authorization    |        | - Row Level Constraints  |
+---------------------+        +-------------------------+        +--------------------------+
```

## Data Flow: React → Express → Prisma → Supabase

1. **User Action:** User initiates an action on the React Frontend (e.g., clicking "Request Maintenance").
2. **Frontend Request:** React compiles a JSON payload and makes an HTTP request to the Express Backend. It attaches the `Authorization: Bearer <token>` header.
3. **Backend Middleware:** Express router intercepts the request. The auth middleware verifies the JWT and decodes the user's ID and Role.
4. **Backend Logic:** The controller processes the business logic (e.g., checking if the asset is currently in a state that allows maintenance).
5. **Database Query:** The controller calls Prisma Client methods to fetch, insert, or update records.
6. **Database Operation:** Prisma translates these methods to SQL queries and executes them against the Supabase PostgreSQL database.
7. **Database Response:** Supabase returns data to Prisma, which parses it into JavaScript objects.
8. **Backend Response:** Express formats the response according to the standard API payload format and sends an HTTP JSON response.
9. **Frontend Update:** React receives the data and updates the local state/UI.

## Module Boundaries

The system is strictly divided into four functional modules:

1. **Identity & Foundation (Module 1):** 
   - Handles `User`, `Department`, `AssetCategory`. 
   - Responsible for JWT issuance and system bootstrapping.
2. **Asset Core (Module 2):** 
   - Handles `Asset`, `Allocation`, `Transfer`. 
   - Tracks the lifecycle states from registration to disposition.
3. **Operations (Module 3):** 
   - Handles `Booking`, `MaintenanceRequest`. 
   - Deals with scheduling, date overlaps, and physical repair lifecycles.
4. **Intelligence (Module 4):** 
   - Handles `AuditCycle`, `AuditItem`, `Notification`, `ActivityLog`. 
   - Reads data from all other modules to generate insights and historical trails.

## Request Lifecycle

1. **Authentication (Middleware):** Validates JWT and attaches `req.user`.
2. **Authorization (Middleware/Controller):** Verifies if `req.user.role` matches required roles (e.g., `ADMIN`, `ASSET_MANAGER`).
3. **Validation (Middleware):** Validates incoming JSON payload schema.
4. **Controller:** Executes core workflow.
5. **Service/Prisma:** Interacts with the database.
6. **Side Effects (Controller):** Triggers Notifications or Activity Logs based on the action.
7. **Response:** Sends structured JSON back to the client.

## Module Dependency Order

To ensure parallel development without blockers, follow this build order:

1. **Tier 1 (Foundation):** Auth, Departments, Categories. *(Unblocks everything else)*
2. **Tier 2 (Core Data):** Users (Employee Directory), Assets. *(Unblocks Operations and Allocations)*
3. **Tier 3 (Transactions):** Allocations, Transfers, Bookings, Maintenance. *(Unblocks Intelligence)*
4. **Tier 4 (Intelligence):** Audits, Notifications, Dashboard, Logs.
