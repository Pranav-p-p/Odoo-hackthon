# Shared Enums

These enums are canonically frozen. They must match exactly in the Prisma Database, Backend Validation, and Frontend Dropdowns.

## Roles
Used for access control and UI rendering.
*   `ADMIN`
*   `ASSET_MANAGER`
*   `DEPARTMENT_HEAD`
*   `EMPLOYEE`

## Asset Status
Defines the physical and operational lifecycle of an asset.
*   `AVAILABLE`: Ready for use or allocation.
*   `ALLOCATED`: Currently assigned to an employee or department.
*   `RESERVED`: Held for a future booking.
*   `UNDER_MAINTENANCE`: Out of commission for repair.
*   `LOST`: Verified missing during an audit.
*   `RETIRED`: Reached end of life, kept for records.
*   `DISPOSED`: Physically removed from the organization.

## Transfer Status
Used in the transfer approval workflow.
*   `REQUESTED`: Waiting for manager approval.
*   `APPROVED`: Manager approved, asset moved.
*   `REJECTED`: Manager denied request.
*   `COMPLETED`: Closed state.

## Booking Status
Used for calendar-based shared resources.
*   `UPCOMING`: Future date.
*   `ONGOING`: Current time is within the start/end window.
*   `COMPLETED`: Time has passed.
*   `CANCELLED`: User cancelled.

## Maintenance Status
Used for repair workflows.
*   `PENDING_APPROVAL`: User requested, waiting on manager.
*   `APPROVED`: Manager validated, waiting on technician.
*   `IN_PROGRESS`: Technician is working on it.
*   `RESOLVED`: Fixed, asset returned to AVAILABLE.
*   `REJECTED`: Request denied.

## Audit Cycle Status
*   `OPEN`: Created, ready for assignment.
*   `IN_PROGRESS`: Auditor is currently checking items.
*   `CLOSED`: Finished and reports generated.

## Audit Item Status
*   `VERIFIED`: Asset is physically present and matches system.
*   `MISSING`: Cannot locate asset.
*   `DAMAGED`: Asset found but condition is poor.

## Notification Types (Strings)
*   `"ASSET_ASSIGNED"`
*   `"MAINTENANCE_UPDATE"`
*   `"BOOKING_REMINDER"`
*   `"TRANSFER_UPDATE"`
*   `"OVERDUE_ALERT"`
*   `"AUDIT_FLAG"`
