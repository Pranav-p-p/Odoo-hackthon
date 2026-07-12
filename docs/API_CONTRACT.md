# API Contract

## Base Environment
*   **Base URL:** `/api/v1`
*   **Authentication:** Bearer token in the `Authorization` header (`Authorization: Bearer <token>`).

## Standard Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {} // Optional validation errors
  }
}
```

## HTTP Status Code Conventions
*   `200 OK`: Successful GET, PUT, PATCH, DELETE
*   `201 Created`: Successful POST
*   `400 Bad Request`: Validation failure or business logic violation (e.g., Double allocation)
*   `401 Unauthorized`: Missing or invalid JWT
*   `403 Forbidden`: Insufficient role permissions
*   `404 Not Found`: Resource does not exist
*   `500 Internal Server Error`: Unhandled server exception

---

## Module 1: Auth & Org

### Auth
*   **POST** `/auth/signup`
    *   *Purpose*: Creates an `EMPLOYEE` user.
    *   *Body*: `{ "name": "...", "email": "...", "password": "...", "departmentId": "uuid" }`
*   **POST** `/auth/login`
    *   *Purpose*: Authenticates and returns JWT.
    *   *Body*: `{ "email": "...", "password": "..." }`
    *   *Returns*: `{ "token": "...", "user": { "id": "...", "role": "EMPLOYEE", ... } }`

### Departments
*   **GET** `/departments`
*   **POST** `/departments` (Admin)
    *   *Body*: `{ "name": "..." }`

### Categories
*   **GET** `/categories`
*   **POST** `/categories` (Admin)
    *   *Body*: `{ "name": "...", "description": "..." }`

### Users / Employees
*   **GET** `/users` (Admin)
*   **PATCH** `/users/:id/role` (Admin)
    *   *Body*: `{ "role": "DEPARTMENT_HEAD" | "ASSET_MANAGER" }`

---

## Module 2: Asset Core

### Assets
*   **GET** `/assets`
    *   *Query*: `?status=...&departmentId=...&categoryId=...`
*   **POST** `/assets` (Asset Manager)
    *   *Body*: `{ "assetTag": "...", "serialNumber": "...", "name": "...", "categoryId": "...", "isBookable": boolean, ... }`
*   **GET** `/assets/:id`

### Allocations
*   **POST** `/allocations` (Asset Manager)
    *   *Purpose*: Allocates asset to user/department.
    *   *Body*: `{ "assetId": "...", "userId": "...", "departmentId": "..." }`
*   **PATCH** `/allocations/:id/return` (Asset Manager)

### Transfers
*   **POST** `/transfers`
    *   *Purpose*: Request transfer to another department.
    *   *Body*: `{ "assetId": "...", "toDepartmentId": "...", "reason": "..." }`
*   **PATCH** `/transfers/:id/approve` (Asset Manager / Admin)
*   **PATCH** `/transfers/:id/reject` (Asset Manager / Admin)

---

## Module 3: Operations

### Bookings
*   **GET** `/bookings`
    *   *Query*: `?assetId=...`
*   **POST** `/bookings`
    *   *Purpose*: Book a shared resource.
    *   *Body*: `{ "assetId": "...", "startTime": "ISO8601", "endTime": "ISO8601" }`
*   **PATCH** `/bookings/:id/cancel`

### Maintenance
*   **GET** `/maintenance-requests`
*   **POST** `/maintenance-requests`
    *   *Body*: `{ "assetId": "...", "issueDescription": "...", "priority": "HIGH" }`
*   **PATCH** `/maintenance-requests/:id/status` (Asset Manager)
    *   *Body*: `{ "status": "APPROVED" | "IN_PROGRESS" | "RESOLVED" }`

---

## Module 4: Intelligence

### Audits
*   **GET** `/audits`
*   **POST** `/audits` (Admin)
    *   *Body*: `{ "name": "...", "departmentId": "...", "auditorId": "..." }`
*   **PATCH** `/audits/:id/items/:itemId` (Auditor)
    *   *Body*: `{ "status": "VERIFIED" | "MISSING" | "DAMAGED", "notes": "..." }`
*   **PATCH** `/audits/:id/close` (Admin)

### Dashboard
*   **GET** `/dashboard/kpi`
    *   *Returns*: `{ "availableAssets": 10, "allocatedAssets": 45, "maintenanceToday": 2, ... }`

### Notifications & Logs
*   **GET** `/notifications`
*   **GET** `/activity-logs`
