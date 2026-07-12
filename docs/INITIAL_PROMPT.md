You are a senior full-stack hackathon architect and technical writer. Your task is to create a complete, internally consistent set of control documents for the AssetFlow hackathon project.

IMPORTANT CONTEXT (do not ignore):
AssetFlow is an Enterprise Asset & Resource Management System. It is not a generic CRUD app. It is an ERP-style workflow system for organizations that manage physical assets and shared resources. The core scope from the problem statement is:

- Maintain departments (with head, parent hierarchy, active/inactive status), asset categories, and an employee directory
- Employee signup creates Employee accounts only; no role selection at signup
- Admin is the only role that can promote employees to Department Head or Asset Manager from the Employee Directory
- Track assets through a lifecycle with states:
  Available, Allocated, Reserved, Under Maintenance, Lost, Retired, Disposed
- Prevent double-allocation of a single asset (show current holder info and offer Transfer Request instead)
- Book shared resources by time slot with overlap validation (reject overlapping requests with conflict details)
- Route maintenance requests through a 6-step Kanban approval workflow: Pending → Approved → Technician Assigned → In Progress → Resolved (+ Rejected)
- Asset status auto-updates to Under Maintenance on approval and back to Available on resolution
- Run audit cycles with auditors, date ranges, expected locations, and auto-generated discrepancy reports
- Surface overdue returns, bookings, maintenance events, notifications (categorized: Alerts/Approvals/Bookings), logs, and a KPI dashboard
- Keep the architecture clean, modular, role-based, and realistic
- Do NOT include purchasing, invoicing, or accounting features

The organizer's Excalidraw mockup defines these 10 screens:
1. Login / Signup — email/password, forgot password, signup creates Employee only, "admin roles assigned later"
2. Dashboard / Home — KPI cards (Available, Allocated, Maintenance Today, Upcoming Returns, Pending Transfers, Active Bookings), overdue alert, quick actions (Register Asset, Book Resource, Raise Request), recent activity
3. Organization Setup (Admin only, 3 tabs) — Departments (name, head, parent dept, status), Categories, Employee Directory (promote/deactivate)
4. Asset Registration & Directory — register with tag/serial/category/location/photo/bookable flag, search/filter, asset detail with history
5. Asset Allocation & Transfer — allocate with expected return, double-allocation block with transfer redirect, transfer approve/reject, return with condition notes
6. Resource Booking — calendar/timeline view, overlap rejection with conflict display, booking statuses
7. Maintenance Management — Kanban board (Pending | Approved | Technician Assigned | In Progress | Resolved), priority levels, auto-status updates
8. Asset Audit — create cycle with scope/auditors/dates, checklist verification (Verified/Missing/Damaged), auto-discrepancy report, close cycle with status updates
9. Reports & Analytics — utilization, maintenance frequency, most-used/idle assets, due-for-maintenance, booking heatmap, export
10. Activity Logs & Notifications — tabbed view (All/Alerts/Approvals/Bookings), notification list with timestamps, mark read

User roles from the brief:
- Admin — manages departments, categories, audit cycles, role assignment, org-wide analytics
- Asset Manager — registers/allocates assets, approves transfers/maintenance/returns
- Department Head — views department assets, approves dept-level requests, books resources for dept
- Employee — views allocated assets, books resources, raises maintenance requests, initiates returns/transfers

Basic workflow from the brief:
- Admin sets up departments (with hierarchy), categories, and role promotions
- Asset Manager registers new assets (with location, photo, bookable flag)
- Assets are allocated to employees/departments or marked bookable
- Double-allocation is blocked — system shows current holder and offers transfer
- Employees book shared resources; overlapping requests are rejected with conflict details
- Maintenance requests must be approved before the asset enters Under Maintenance
- Overdue returns are flagged automatically
- Audit cycles assign auditors, verify assets against expected locations, and generate discrepancy reports
- All activity is tracked through categorized notifications, logs, and reports

TECH STACK (already frozen):
- Frontend: React (Functional Components + Hooks)
- Routing: React Router v6
- Styling: CSS Modules or Tailwind CSS
- HTTP Client: Axios
- Backend: Node.js + Express.js
- Database: Supabase PostgreSQL
- ORM: Prisma
- Auth: Custom JWT
- Password Hashing: bcrypt
- Date/Time: date-fns or dayjs
- Charts: recharts or chart.js (for Screen 9)
- Icons: lucide-react or react-icons
- UI: responsive, dashboard-oriented with sidebar navigation

TEAM STRUCTURE (must be used exactly):
- 4 members
- Work must be split into isolated vertical slices (full-stack: DB + Express + React per screen)
- Member 1: Screen 1 (Login/Signup) + Screen 3 (Org Setup) — Identity & Foundation
- Member 2: Screen 4 (Assets) + Screen 5 (Allocation & Transfer) — Asset Core
- Member 3: Screen 6 (Booking) + Screen 7 (Maintenance) — Operations
- Member 4: Screen 2 (Dashboard) + Screen 8 (Audit) + Screen 9 (Reports) + Screen 10 (Notifications) — Intelligence
- Handoffs must be explicit with hour targets
- Backend and frontend must share a single API contract and shared enums
- The documents must prevent frontend/backend endpoint mismatch

YOUR JOB:
Create a complete set of markdown control files that can be committed directly to the repository. The output must be accurate, implementable, and consistent across all files. Do not hallucinate extra features outside the brief. If a detail is not supported by the brief, keep it minimal or mark it as TODO rather than inventing it.

Before writing any file, first define and freeze:
1. Canonical naming conventions
2. Canonical roles
3. Canonical statuses and enum values (including DepartmentStatus, UserStatus, MaintenancePriority)
4. Canonical endpoint names
5. Canonical table names
6. Canonical module ownership boundaries (mapped to screens)
7. Canonical request/response shape conventions

Then generate these files:

1. SYSTEM_ARCHITECTURE.md
   - high-level architecture diagram
   - sidebar navigation matching the 10 screens
   - React → Express → Prisma → Supabase flow
   - module boundaries mapped to screens
   - request lifecycle
   - module dependency order
   - backend and frontend folder structures

2. TECH_STACK_FREEZE.md
   - final approved stack with versions
   - additional libraries per screen (charts, calendar)
   - discouraged libraries
   - rules against changing stack
   - one-line responsibility per member with screen references

3. API_CONTRACT.md
   - base URL and auth header
   - standard response format (success, paginated, error)
   - HTTP status code conventions (including 409 Conflict)
   - all endpoints organized by module/screen:
     - Auth (signup, login, forgot-password, me)
     - Departments (CRUD with hierarchy, status toggle)
     - Categories (CRUD)
     - Users (list, role promotion, status toggle)
     - Assets (CRUD with search/filter/location/photo)
     - Allocations (create with conflict detection, return with condition)
     - Transfers (create, approve, reject)
     - Bookings (create with overlap validation, cancel)
     - Maintenance (create, approve, reject, assign, start, resolve)
     - Audits (create cycle, verify items, discrepancy report, close)
     - Dashboard (KPI, recent activity)
     - Reports (utilization, frequency, idle, most-used, heatmap, export)
     - Notifications (list with category filter, unread count, mark read)
     - Activity Logs (paginated, filterable)

4. DATABASE_SCHEMA.md
   - complete Prisma schema
   - enums: Role, UserStatus, DepartmentStatus, AssetStatus, AllocationStatus, TransferStatus, BookingStatus, MaintenancePriority, MaintenanceStatus, AuditStatus, AuditItemStatus
   - tables: Department (with headId, parentDepartmentId, status), User (with status), AssetCategory, Asset (with location, photoUrl), Allocation (with returnCondition, returnNotes, status), Transfer (with fromUserId, toUserId, approvedById), Booking (with purpose), MaintenanceRequest (with priority, technicianId, photoUrl), AuditCycle (with startDate, endDate, locationScope), AuditItem (with expectedLocation, PENDING default), Notification (with category), ActivityLog
   - relationships, indexes

5. WORKFLOW.md
   - end-to-end workflow for each of the 10 screens
   - login/signup with forgot password
   - dashboard KPI calculations
   - admin setup with department hierarchy
   - asset registration with auto-tag
   - allocation with double-allocation block and transfer redirect
   - booking with overlap validation and calendar display
   - maintenance Kanban 6-step flow
   - audit cycle lifecycle
   - reports and export
   - notifications with tab filtering
   - global background workflows (overdue detection, booking transitions)

6. ROLE_DISTRIBUTION.md
   - 4 members mapped to specific screens
   - backend and frontend ownership per member
   - handoff points with hour targets
   - integration checkpoints table
   - do-not-touch matrix

7. GIT_WORKFLOW.md
   - branch strategy
   - commit message style with module prefixes
   - PR / merge rules
   - backend route ownership table
   - frontend page ownership table
   - shared files coordination list
   - Prisma schema rules
   - integration checkpoint git actions

8. SHARED_ENUMS.md
   - all enums with descriptions
   - notification types with category mapping
   - notification categories for tab filters
   - validation constants

9. ACCEPTANCE_CRITERIA.md
   - must-have: Screens 1–7
   - nice-to-have: Screens 8–10
   - out of scope
   - demo script (4 acts walking through all screens)
   - working submission criteria table

GLOBAL RULES FOR ALL FILES:
- Be consistent across all documents.
- Use the same exact table names, endpoint names, enum values, and field names everywhere.
- Keep the documents practical for an 8-hour hackathon.
- Prefer simple, robust implementations over fancy but risky ones.
- Use clear markdown headings and tables where useful.
- Make the docs directly usable in a GitHub repository.
- Do not introduce scopes like invoicing, purchasing, payroll, or accounting.
- Do not invent features not mentioned in the AssetFlow brief or Excalidraw mockup.
- If a feature is optional or risky for an 8-hour hackathon, mark it as bonus or future scope.
- The system must feel like a clean ERP module, not a toy app.

FIRST OUTPUT REQUIRED:
Start by writing a short "Canonical Decisions" section that freezes:
- the final stack
- the final roles
- the final enums (all of them)
- the final naming convention
- the final module ownership plan (mapped to screens)

Then generate all nine markdown files in full.