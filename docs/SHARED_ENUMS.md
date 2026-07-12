# Shared Enums

These enums are canonically frozen. They must match exactly in the Prisma Database, Backend Validation, and Frontend Dropdowns.

---

## Roles
Used for access control and UI rendering.
*   `ADMIN`
*   `ASSET_MANAGER`
*   `DEPARTMENT_HEAD`
*   `EMPLOYEE`

## User Status
Controls whether a user can log in and appear in active lists.
*   `ACTIVE`: Normal operating state.
*   `INACTIVE`: Deactivated by Admin; cannot log in or be assigned assets.

## Department Status
Controls whether a department appears in active picklists (Screen 3 / Screen 4 / Screen 5).
*   `ACTIVE`: Normal operating state.
*   `INACTIVE`: Deactivated by Admin; hidden from allocation and booking forms.

---

## Asset Status
Defines the physical and operational lifecycle of an asset.
*   `AVAILABLE`: Ready for use or allocation.
*   `ALLOCATED`: Currently assigned to an employee or department.
*   `RESERVED`: Held for a future booking.
*   `UNDER_MAINTENANCE`: Out of commission for repair (auto-set on maintenance approval).
*   `LOST`: Verified missing during an audit.
*   `RETIRED`: Reached end of life, kept for records.
*   `DISPOSED`: Physically removed from the organization.

## Allocation Status
Used for tracking whether an allocation is active or returned.
*   `ACTIVE`: Asset is currently held by the employee.
*   `RETURNED`: Employee has returned the asset.
*   `OVERDUE`: Past the expected return date and not yet returned.

## Transfer Status
Used in the transfer approval workflow (Screen 5).
*   `REQUESTED`: Waiting for manager/admin approval.
*   `APPROVED`: Approved, asset re-allocation in progress.
*   `REJECTED`: Manager/admin denied the request.
*   `COMPLETED`: Transfer executed, asset moved, history updated.

## Booking Status
Used for calendar-based shared resources (Screen 6).
*   `UPCOMING`: Future date, slot reserved.
*   `ONGOING`: Current time is within the start/end window.
*   `COMPLETED`: Time has passed.
*   `CANCELLED`: User cancelled the booking.

---

## Maintenance Priority
Used when raising a maintenance request (Screen 7).
*   `LOW`: Minor issue, non-urgent.
*   `MEDIUM`: Needs attention but not blocking work.
*   `HIGH`: Blocking normal operations.
*   `CRITICAL`: Safety hazard or production-critical failure.

## Maintenance Status
Used for the Kanban repair workflow (Screen 7).
*   `PENDING_APPROVAL`: User raised request, waiting on Asset Manager.
*   `APPROVED`: Asset Manager validated, waiting on technician assignment.
*   `TECHNICIAN_ASSIGNED`: Technician allocated, work not yet started.
*   `IN_PROGRESS`: Technician is actively working on it.
*   `RESOLVED`: Fixed, asset returned to AVAILABLE.
*   `REJECTED`: Request denied by Asset Manager.

---

## Audit Cycle Status
*   `OPEN`: Created, auditors assigned, verification not yet started.
*   `IN_PROGRESS`: Auditor is currently checking items.
*   `CLOSED`: Finished, discrepancy report generated, asset statuses updated.

## Audit Item Status
*   `PENDING`: Not yet verified by the auditor.
*   `VERIFIED`: Asset is physically present and matches system records.
*   `MISSING`: Cannot locate asset.
*   `DAMAGED`: Asset found but condition is poor.

---

## Notification Types (Strings)
Each notification carries a `type` string used for rendering and filtering.

| Type String | Category | Trigger |
|---|---|---|
| `ASSET_ASSIGNED` | `ALERTS` | Asset allocated to an employee |
| `MAINTENANCE_APPROVED` | `APPROVALS` | Maintenance request approved |
| `MAINTENANCE_REJECTED` | `APPROVALS` | Maintenance request rejected |
| `BOOKING_CONFIRMED` | `BOOKINGS` | Booking slot confirmed |
| `BOOKING_CANCELLED` | `BOOKINGS` | Booking cancelled |
| `BOOKING_REMINDER` | `BOOKINGS` | Reminder before booking slot starts |
| `TRANSFER_APPROVED` | `APPROVALS` | Transfer request approved |
| `TRANSFER_REJECTED` | `APPROVALS` | Transfer request rejected |
| `OVERDUE_RETURN_ALERT` | `ALERTS` | Allocation past expected return date |
| `AUDIT_DISCREPANCY_FLAGGED` | `ALERTS` | Audit found missing/damaged asset |

## Notification Categories (Tab Filters — Screen 10)
Used on the frontend for tab-based filtering.
*   `ALL`: Show every notification.
*   `ALERTS`: Asset assignments, overdue alerts, audit flags.
*   `APPROVALS`: Maintenance and transfer approval/rejection updates.
*   `BOOKINGS`: Booking confirmations, cancellations, and reminders.

---

## Common Validation Constants
*   `PASSWORD_MIN_LENGTH`: 8
*   `ASSET_TAG_PREFIX`: `AF-`
*   `ASSET_TAG_FORMAT`: `AF-XXXX` (zero-padded 4-digit)
*   `BOOKING_MIN_DURATION_MINUTES`: 15
*   `BOOKING_MAX_DURATION_HOURS`: 8
*   `MAX_FILE_UPLOAD_MB`: 5
