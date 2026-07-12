# API Contract

## Base Environment
*   **Base URL:** `/api/v1`
*   **Authentication:** Bearer token in the `Authorization` header (`Authorization: Bearer <token>`).
*   All endpoints except `/auth/signup`, `/auth/login`, and `/auth/forgot-password` require a valid JWT.

## Standard Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

**Paginated Success Response:**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 142
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  }
}
```

## HTTP Status Code Conventions
*   `200 OK`: Successful GET, PUT, PATCH, DELETE
*   `201 Created`: Successful POST
*   `400 Bad Request`: Validation failure or business logic violation (e.g., double allocation, booking overlap)
*   `401 Unauthorized`: Missing or invalid JWT
*   `403 Forbidden`: Insufficient role permissions
*   `404 Not Found`: Resource does not exist
*   `409 Conflict`: State conflict (e.g., asset already allocated, booking overlap)
*   `500 Internal Server Error`: Unhandled server exception

---

## Module 1: Auth & Organization (Screen 1, Screen 3)

### Auth

*   **POST** `/auth/signup`
    *   *Purpose*: Creates an `EMPLOYEE` user with `ACTIVE` status.
    *   *Body*: `{ "name": "...", "email": "...", "password": "...", "departmentId": "uuid" }`
    *   *Validation*: Email unique, password min 8 chars.
    *   *Success (201)*: `{ "token": "...", "user": { "id", "name", "email", "role": "EMPLOYEE", "status": "ACTIVE" } }`

*   **POST** `/auth/login`
    *   *Purpose*: Authenticates and returns JWT. Rejects `INACTIVE` users.
    *   *Body*: `{ "email": "...", "password": "..." }`
    *   *Success (200)*: `{ "token": "...", "user": { "id", "name", "email", "role", "status", "departmentId" } }`
    *   *Error (401)*: Invalid credentials. *Error (403)*: User is INACTIVE.

*   **POST** `/auth/forgot-password`
    *   *Purpose*: Initiates password reset flow.
    *   *Body*: `{ "email": "..." }`
    *   *Success (200)*: `{ "message": "Reset link sent if email exists" }`

*   **GET** `/auth/me`
    *   *Purpose*: Returns current user profile from JWT.
    *   *Success (200)*: `{ "id", "name", "email", "role", "status", "departmentId", "department": { "id", "name" } }`

### Departments (Screen 3 — Tab A)

*   **GET** `/departments`
    *   *Query*: `?status=ACTIVE|INACTIVE`
    *   *Returns*: Array of departments with `head` and `parentDepartment` populated.

*   **POST** `/departments` *(Admin only)*
    *   *Body*: `{ "name": "...", "headId": "uuid?", "parentDepartmentId": "uuid?", "status": "ACTIVE" }`

*   **PATCH** `/departments/:id` *(Admin only)*
    *   *Purpose*: Edit department details.
    *   *Body*: `{ "name?": "...", "headId?": "uuid", "parentDepartmentId?": "uuid", "status?": "ACTIVE|INACTIVE" }`

### Asset Categories (Screen 3 — Tab B)

*   **GET** `/categories`
*   **POST** `/categories` *(Admin only)*
    *   *Body*: `{ "name": "...", "description": "..." }`
*   **PATCH** `/categories/:id` *(Admin only)*
    *   *Body*: `{ "name?": "...", "description?": "..." }`

### Users / Employee Directory (Screen 3 — Tab C)

*   **GET** `/users` *(Admin only)*
    *   *Query*: `?role=...&status=ACTIVE|INACTIVE&departmentId=...`
    *   *Returns*: Array of users with department name populated.

*   **PATCH** `/users/:id/role` *(Admin only)*
    *   *Purpose*: Promote an Employee to Department Head or Asset Manager.
    *   *Body*: `{ "role": "DEPARTMENT_HEAD" | "ASSET_MANAGER" }`
    *   *Validation*: Cannot set role to `ADMIN`. Target user must be `ACTIVE`.

*   **PATCH** `/users/:id/status` *(Admin only)*
    *   *Purpose*: Activate or deactivate a user.
    *   *Body*: `{ "status": "ACTIVE" | "INACTIVE" }`

---

## Module 2: Asset Core (Screen 4, Screen 5)

### Assets (Screen 4)

*   **GET** `/assets`
    *   *Query*: `?status=...&departmentId=...&categoryId=...&location=...&search=...&isBookable=true|false`
    *   `search` matches against `assetTag`, `serialNumber`, or `name`.

*   **POST** `/assets` *(Asset Manager only)*
    *   *Body*:
    ```json
    {
      "assetTag": "AF-0001",
      "serialNumber": "...",
      "name": "...",
      "categoryId": "uuid",
      "departmentId": "uuid?",
      "isBookable": false,
      "acquisitionDate": "ISO8601?",
      "acquisitionCost": 0.0,
      "condition": "Good",
      "location": "...",
      "photoUrl": "..."
    }
    ```

*   **GET** `/assets/:id`
    *   *Returns*: Full asset detail with allocation history and maintenance history.

*   **PATCH** `/assets/:id` *(Asset Manager only)*
    *   *Body*: Partial update of any editable asset field.

### Allocations (Screen 5)

*   **GET** `/allocations`
    *   *Query*: `?assetId=...&userId=...&status=ACTIVE|RETURNED|OVERDUE`

*   **POST** `/allocations` *(Asset Manager only)*
    *   *Purpose*: Allocate an `AVAILABLE` asset to a user.
    *   *Body*: `{ "assetId": "uuid", "userId": "uuid", "expectedReturn": "ISO8601?" }`
    *   *Side effects*: Asset status → `ALLOCATED`. Creates `ASSET_ASSIGNED` notification.
    *   *Error (409)*: Asset not `AVAILABLE` — returns `{ "currentHolder": { "name", "department" }, "suggestTransfer": true }`.

*   **PATCH** `/allocations/:id/return` *(Asset Manager only)*
    *   *Purpose*: Mark an allocation as returned.
    *   *Body*: `{ "returnCondition": "Good|Fair|Damaged", "returnNotes": "..." }`
    *   *Side effects*: Asset status → `AVAILABLE`. Allocation status → `RETURNED`.

### Transfers (Screen 5)

*   **GET** `/transfers`
    *   *Query*: `?status=...&assetId=...`

*   **POST** `/transfers`
    *   *Purpose*: Request transfer of an already-allocated asset.
    *   *Body*: `{ "assetId": "uuid", "toUserId": "uuid?", "toDeptId": "uuid", "reason": "..." }`
    *   `fromUserId` and `fromDeptId` are auto-populated from the current allocation.

*   **PATCH** `/transfers/:id/approve` *(Asset Manager / Admin)*
    *   *Side effects*: Transfer status → `APPROVED`. Old allocation closed. New allocation created. Transfer → `COMPLETED`. Creates `TRANSFER_APPROVED` notification.

*   **PATCH** `/transfers/:id/reject` *(Asset Manager / Admin)*
    *   *Body*: `{ "reason": "..." }`
    *   *Side effects*: Transfer status → `REJECTED`. Creates `TRANSFER_REJECTED` notification.

---

## Module 3: Operations (Screen 6, Screen 7)

### Bookings (Screen 6)

*   **GET** `/bookings`
    *   *Query*: `?assetId=...&userId=...&date=ISO8601&status=...`

*   **POST** `/bookings`
    *   *Purpose*: Book a shared resource (asset with `isBookable: true`).
    *   *Body*: `{ "assetId": "uuid", "startTime": "ISO8601", "endTime": "ISO8601", "purpose": "..." }`
    *   *Validation*: Asset must be `isBookable: true`. No overlap with existing non-CANCELLED bookings.
    *   *Error (409)*: Overlap detected — returns `{ "conflictingBooking": { "startTime", "endTime", "bookedBy" } }`.
    *   *Success*: Creates `BOOKING_CONFIRMED` notification.

*   **PATCH** `/bookings/:id/cancel`
    *   *Side effects*: Booking status → `CANCELLED`. Creates `BOOKING_CANCELLED` notification.

### Maintenance (Screen 7)

*   **GET** `/maintenance-requests`
    *   *Query*: `?status=...&assetId=...&priority=...`

*   **POST** `/maintenance-requests`
    *   *Purpose*: Raise a maintenance request for an asset.
    *   *Body*: `{ "assetId": "uuid", "issueDescription": "...", "priority": "LOW|MEDIUM|HIGH|CRITICAL", "photoUrl": "..." }`
    *   *Initial status*: `PENDING_APPROVAL`.

*   **PATCH** `/maintenance-requests/:id/approve` *(Asset Manager)*
    *   *Side effects*: Status → `APPROVED`. Asset status → `UNDER_MAINTENANCE`. Creates `MAINTENANCE_APPROVED` notification.

*   **PATCH** `/maintenance-requests/:id/reject` *(Asset Manager)*
    *   *Body*: `{ "reason": "..." }`
    *   *Side effects*: Status → `REJECTED`. Creates `MAINTENANCE_REJECTED` notification.

*   **PATCH** `/maintenance-requests/:id/assign` *(Asset Manager)*
    *   *Purpose*: Assign a technician.
    *   *Body*: `{ "technicianId": "uuid" }`
    *   *Side effects*: Status → `TECHNICIAN_ASSIGNED`.

*   **PATCH** `/maintenance-requests/:id/start` *(Asset Manager / Technician)*
    *   *Side effects*: Status → `IN_PROGRESS`.

*   **PATCH** `/maintenance-requests/:id/resolve` *(Asset Manager / Technician)*
    *   *Body*: `{ "resolvedNotes": "..." }`
    *   *Side effects*: Status → `RESOLVED`. Asset status → `AVAILABLE`.

---

## Module 4: Intelligence (Screen 2, Screen 8, Screen 9, Screen 10)

### Dashboard (Screen 2)

*   **GET** `/dashboard/kpi`
    *   *Returns*:
    ```json
    {
      "assetsAvailable": 128,
      "assetsAllocated": 76,
      "maintenanceToday": 4,
      "upcomingReturns": 12,
      "pendingTransfers": 3,
      "activeBookings": 9,
      "overdueReturns": 3
    }
    ```

*   **GET** `/dashboard/recent-activity`
    *   *Returns*: Latest 10 activity log entries.

### Audits (Screen 8)

*   **GET** `/audits`
    *   *Query*: `?status=...&departmentId=...`

*   **POST** `/audits` *(Admin / Asset Manager)*
    *   *Purpose*: Create an audit cycle.
    *   *Body*: `{ "name": "...", "departmentId": "uuid?", "locationScope": "...", "auditorId": "uuid", "startDate": "ISO8601", "endDate": "ISO8601" }`
    *   *Side effects*: Auto-populates `AuditItem` records for all assets in scope.

*   **GET** `/audits/:id`
    *   *Returns*: Full audit cycle with all items and their verification statuses.

*   **PATCH** `/audits/:id/items/:itemId` *(Auditor)*
    *   *Purpose*: Mark an audit item as verified, missing, or damaged.
    *   *Body*: `{ "actualStatus": "VERIFIED" | "MISSING" | "DAMAGED", "notes": "..." }`

*   **GET** `/audits/:id/discrepancy-report`
    *   *Returns*: Only items with `actualStatus` of `MISSING` or `DAMAGED`.

*   **PATCH** `/audits/:id/close` *(Admin / Asset Manager)*
    *   *Side effects*: Audit status → `CLOSED`. Assets marked `MISSING` → status updated to `LOST`. Creates `AUDIT_DISCREPANCY_FLAGGED` notifications for Admin.

### Reports & Analytics (Screen 9)

*   **GET** `/reports/utilization`
    *   *Query*: `?departmentId=...&period=week|month|quarter`
    *   *Returns*: Utilization percentage by department.

*   **GET** `/reports/maintenance-frequency`
    *   *Query*: `?categoryId=...&period=...`
    *   *Returns*: Maintenance request count per asset/category.

*   **GET** `/reports/idle-assets`
    *   *Returns*: Assets that have been `AVAILABLE` without allocation for 30+ days.

*   **GET** `/reports/most-used`
    *   *Returns*: Top assets by allocation count + booking count.

*   **GET** `/reports/due-for-maintenance`
    *   *Returns*: Assets nearing scheduled maintenance or retirement threshold.

*   **GET** `/reports/department-allocation`
    *   *Returns*: Asset count breakdown by department.

*   **GET** `/reports/booking-heatmap`
    *   *Query*: `?assetId=...`
    *   *Returns*: Booking count by hour-of-day and day-of-week.

*   **GET** `/reports/export`
    *   *Query*: `?type=utilization|maintenance|allocation|booking`
    *   *Returns*: CSV download.

### Notifications (Screen 10)

*   **GET** `/notifications`
    *   *Query*: `?category=ALL|ALERTS|APPROVALS|BOOKINGS&isRead=true|false`
    *   *Returns*: Paginated notification list, newest first.

*   **GET** `/notifications/unread-count`
    *   *Returns*: `{ "count": 5 }`

*   **PATCH** `/notifications/:id/read`
    *   *Side effects*: Sets `isRead: true`.

*   **PATCH** `/notifications/read-all`
    *   *Side effects*: Marks all user notifications as read.

### Activity Logs (Screen 10)

*   **GET** `/activity-logs`
    *   *Query*: `?entityType=...&entityId=...&userId=...&page=1&limit=20`
    *   *Returns*: Paginated activity log, newest first.
