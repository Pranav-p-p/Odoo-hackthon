# End-to-End Workflows

This document defines the exact operational workflows for the core functionalities of AssetFlow.

## 1. Identity & Setup Workflow
1. **Signup:** An employee creates an account using email/password. They are assigned the default `EMPLOYEE` role.
2. **Setup:** An `ADMIN` logs in and creates Organization `Departments` and `Asset Categories`.
3. **Promotion:** The `ADMIN` navigates to the Employee Directory and promotes select users to `DEPARTMENT_HEAD` or `ASSET_MANAGER`.

## 2. Asset Lifecycle Workflow
1. **Registration:** `ASSET_MANAGER` creates a new asset record, assigning an Asset Tag, Category, and default Status (`AVAILABLE`). If it's a shared resource, `isBookable` is set to `true`.
2. **Allocation:** `ASSET_MANAGER` allocates an `AVAILABLE` asset to an `EMPLOYEE`. The asset status becomes `ALLOCATED`. A record is created in the `Allocation` table.
3. **Return:** When the employee returns the asset, the allocation is closed (`returnedAt` populated) and status reverts to `AVAILABLE`.
4. **Retirement:** At the end of its life, the asset is updated to `RETIRED` or `DISPOSED`.

## 3. Transfer Workflow
1. **Request:** A `DEPARTMENT_HEAD` or `EMPLOYEE` requests to transfer an asset to another department. A `Transfer` record is created (`REQUESTED`).
2. **Approval:** An `ASSET_MANAGER` or `ADMIN` reviews the request.
3. **Execution:** Upon approval, the `Transfer` status becomes `APPROVED`, the asset's `departmentId` is updated, and an Activity Log is generated.

## 4. Resource Booking Workflow
1. **Booking Request:** An `EMPLOYEE` views the calendar for an asset marked `isBookable=true`. They select a time slot.
2. **Overlap Validation:** The backend checks the `Booking` table for any overlapping times for that `assetId` excluding `CANCELLED` statuses. If an overlap exists, the API returns `400 Bad Request`.
3. **Confirmation:** If valid, the booking is saved as `UPCOMING`.
4. **Execution:** Status shifts to `ONGOING` when the time starts, and `COMPLETED` when done.

## 5. Maintenance Workflow
1. **Raise Request:** Any user notices an issue and submits a `MaintenanceRequest` (`PENDING_APPROVAL`).
2. **Approval:** The `ASSET_MANAGER` approves the request. 
3. **Auto-Status Update:** Upon approval, the asset's core status automatically changes to `UNDER_MAINTENANCE`.
4. **Resolution:** The technician (or manager) marks the request as `RESOLVED`. The asset status automatically reverts to `AVAILABLE` (or previous state).

## 6. Audit Workflow
1. **Initiation:** `ADMIN` or `ASSET_MANAGER` creates an `AuditCycle`, specifying a Department and an Auditor.
2. **Execution:** The Auditor physical verifies assets, updating each `AuditItem` status to `VERIFIED`, `MISSING`, or `DAMAGED`.
3. **Completion:** The audit is marked `CLOSED`.
4. **Discrepancy Action:** Missing or damaged assets automatically trigger a `Notification` to the Admin for discrepancy review. Asset statuses may be updated to `LOST`.

## 7. Global Intelligence (Background Workflows)
*   **Activity Logging:** Every POST, PUT, PATCH, DELETE action creates an entry in the `ActivityLog` table.
*   **KPIs:** The dashboard queries aggregates (Counts of status, Overdue returns) on page load.
*   **Notifications:** Overdue allocations trigger a notification payload to the relevant user and department head.
