# Acceptance Criteria (Hackathon Scope)

This document defines what constitutes a "finished" project for the demo. It strictly separates Must-Haves from Nice-to-Haves. If time is running out, prioritize the Must-Haves.

## 🟢 Must-Have (Minimum Viable Demo Checklist)

### 1. Identity & Config
- [ ] Users can sign up as `EMPLOYEE` and log in successfully.
- [ ] Admin can create a Department and an Asset Category.
- [ ] Admin can promote an Employee to `ASSET_MANAGER`.

### 2. Core Asset Operations
- [ ] Asset Manager can register a new physical asset (e.g., "MacBook Pro").
- [ ] Asset Manager can allocate the asset to a specific Employee.
- [ ] The system visually prevents allocating an asset that is already `ALLOCATED`.

### 3. Resource Booking
- [ ] Employee can book an asset that has `isBookable: true` (e.g., "Conference Room").
- [ ] The backend throws an error if a second booking overlaps with the first booking's time slot.

### 4. Maintenance Workflow
- [ ] Employee can raise a Maintenance Request for a broken asset.
- [ ] Asset Manager approving the maintenance automatically changes the asset's status to `UNDER_MAINTENANCE`.

### 5. Dashboards & Visibility
- [ ] Dashboard displays accurate aggregate counts: Total Available, Total Allocated, Active Maintenance.
- [ ] Asset Directory can filter by Status and Category.

---

## 🟡 Nice-to-Have (Do these only if MVP is done)

- [ ] **Audits:** Complete the Audit Cycle flow and discrepancy reporting.
- [ ] **Transfers:** Department-to-Department transfer approval flow.
- [ ] **Notifications:** In-app dropdown showing unread alerts.
- [ ] **Activity Logs:** A chronological timeline of who did what, visible on the asset detail page.

---

## 🔴 Out of Scope (Do NOT build)

- Invoicing and purchasing workflows.
- Depreciation calculations or financial accounting.
- Payroll integration.
- Hardware integrations (Actual barcode/RFID scanning — mock it with manual entry or a simple button click for the demo).
- Mobile apps (Responsive web UI is sufficient).

## Demo Script Strategy
1. **Login as Admin:** Show clean dashboard, setup a department, promote a user.
2. **Login as Manager:** Register a high-value asset. Allocate it.
3. **Login as Employee:** Show the asset in "My Assets". Raise a maintenance ticket. Try to book a projector, then try to double-book it to show the validation error.
4. **Login as Manager:** Approve the maintenance ticket, show how the asset status updates globally.
