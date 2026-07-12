You are a senior full-stack hackathon architect and technical writer. Your task is to create a complete, internally consistent set of control documents for the AssetFlow hackathon project.

IMPORTANT CONTEXT (do not ignore):
AssetFlow is an Enterprise Asset & Resource Management System. It is not a generic CRUD app. It is an ERP-style workflow system for organizations that manage physical assets and shared resources. The core scope from the problem statement is:

- Maintain departments, asset categories, and an employee directory
- Employee signup creates Employee accounts only; no role selection at signup
- Admin is the only role that can promote employees to Department Head or Asset Manager from the Employee Directory
- Track assets through a lifecycle with states:
  Available, Allocated, Reserved, Under Maintenance, Lost, Retired, Disposed
- Prevent double-allocation of a single asset
- Book shared resources by time slot with overlap validation
- Route maintenance requests through approval before repair work starts
- Run audit cycles with auditors and discrepancy reports
- Surface overdue returns, bookings, maintenance events, notifications, logs, and a KPI dashboard
- Keep the architecture clean, modular, role-based, and realistic
- Do NOT include purchasing, invoicing, or accounting features

The problem statement also defines these screens and behaviors:
1. Login / Signup
   - Signup creates Employee only
   - Admin promotes roles later
   - Email/password login, forgot password, session validation
2. Dashboard / Home
   - KPI cards: Assets Available, Assets Allocated, Maintenance Today, Active Bookings, Pending Transfers, Upcoming Returns
   - Overdue returns highlighted separately
   - Quick actions: Register Asset, Book Resource, Raise Maintenance Request
3. Organization Setup (Admin only, 3 tabs)
   - Department management
   - Asset category management
   - Employee directory with role promotion
4. Asset Registration & Directory
   - Asset Tag, serial number, acquisition date, acquisition cost, condition, location, photo/documents, shared/bookable flag
   - Search/filter by asset tag, serial number, QR code, category, status, department, location
   - Asset history: allocation + maintenance
5. Asset Allocation & Transfer
   - Allocation to employee/department
   - Conflict handling when asset already allocated
   - Transfer workflow: Requested → Approved → Re-allocated
   - Return flow and overdue tracking
6. Resource Booking
   - Calendar view
   - Overlap validation
   - Upcoming / Ongoing / Completed / Cancelled booking statuses
7. Maintenance Management
   - Raise request, approval, technician assignment, in progress, resolved
   - Asset status auto-updates to Under Maintenance on approval and back to Available on resolution
8. Asset Audit
   - Create audit cycle
   - Assign auditors
   - Verified / Missing / Damaged
   - Auto discrepancy report
   - Close audit cycle and update statuses
9. Reports & Analytics
   - Utilization, maintenance frequency, due-for-maintenance, department allocation, booking heatmap, exportable reports
10. Activity Logs & Notifications
   - Asset Assigned, Maintenance Approved/Rejected, Booking Confirmed/Cancelled/Reminder, Transfer Approved, Overdue Return Alert, Audit Discrepancy Flagged

User roles from the brief:
- Admin
- Asset Manager
- Department Head
- Employee

Basic workflow from the brief:
- Admin sets up departments, categories, and role promotions
- Asset Manager registers new assets
- Assets are allocated to employees/departments or marked bookable
- Employees book shared resources
- Maintenance requests must be approved before the asset enters maintenance
- Overdue returns are flagged automatically
- Audit cycles assign auditors and generate discrepancy reports
- All activity is tracked through notifications, logs, and reports

TECH STACK (already frozen):
- Frontend: React
- Backend: Node.js + Express
- Database: Supabase PostgreSQL
- ORM: Prisma
- Auth: JWT
- UI: responsive, dashboard-oriented

TEAM STRUCTURE (must be used exactly):
- 4 members
- Work must be split into isolated phases with minimal overlap
- Each member owns a separate module set
- Handoffs must be explicit
- Backend and frontend must share a single API contract and shared enums
- One person should not own everything
- The documents must prevent frontend/backend endpoint mismatch

YOUR JOB:
Create a complete set of markdown control files that can be committed directly to the repository. The output must be accurate, implementable, and consistent across all files. Do not hallucinate extra features outside the brief. If a detail is not supported by the brief, keep it minimal or mark it as TODO rather than inventing it.

Before writing any file, first define and freeze:
1. Canonical naming conventions
2. Canonical roles
3. Canonical statuses and enum values
4. Canonical endpoint names
5. Canonical table names
6. Canonical module ownership boundaries
7. Canonical request/response shape conventions

Then generate these files:

1. SYSTEM_ARCHITECTURE.md
   - high-level architecture diagram in text
   - React → Express → Prisma → Supabase flow
   - module boundaries
   - request lifecycle
   - module dependency order
   - data flow between frontend, backend, and database

2. TECH_STACK_FREEZE.md
   - final approved stack
   - exact tools and libraries allowed
   - exact tools and libraries discouraged or not allowed
   - version assumptions
   - rules against changing stack during the hackathon
   - one-line responsibility per member
   - what each member must use

3. API_CONTRACT.md
   - base URL
   - standard request/response format
   - HTTP status code conventions
   - all endpoints needed for AssetFlow
   - for every endpoint include:
     method
     path
     purpose
     request body
     success response body
     error response body
     validation rules
   - the API contract must cover:
     auth
     departments
     employee directory
     asset categories
     assets
     allocations
     transfers
     bookings
     maintenance
     audits
     dashboard
     notifications
     activity logs
   - use exact field names and exact enum values everywhere
   - keep frontend and backend payloads perfectly aligned

4. DATABASE_SCHEMA.md
   - complete schema for Supabase PostgreSQL
   - tables, columns, types, primary keys, foreign keys, unique constraints, indexes
   - relationships
   - history tables
   - required vs optional fields
   - status enums
   - soft delete or inactive strategy if needed
   - anything that is necessary for the stated workflows
   - avoid overengineering

5. WORKFLOW.md
   - end-to-end business workflow
   - login/signup workflow
   - admin setup workflow
   - asset registration workflow
   - allocation and return workflow
   - transfer approval workflow
   - booking overlap workflow
   - maintenance approval workflow
   - audit cycle workflow
   - notification workflow
   - dashboard KPI calculation workflow

6. ROLE_DISTRIBUTION.md
   - divide work into 4 isolated phases for 4 members
   - assign ownership clearly and narrowly
   - specify what each member builds
   - specify what each member must not touch
   - specify handoff points
   - include integration checkpoints
   - structure this so the team can work in parallel

7. GIT_WORKFLOW.md
   - branch strategy
   - commit message style
   - PR / merge rules
   - collaborator rules
   - ownership rules
   - integration checkpoints
   - conflict avoidance rules
   - how frontend/backend teams should keep endpoints synchronized

8. SHARED_ENUMS.md
   - roles
   - user statuses
   - department statuses
   - asset statuses
   - allocation statuses
   - transfer statuses
   - booking statuses
   - maintenance statuses
   - audit statuses
   - notification types
   - common validation constants
   - these enums must match the API contract exactly

9. ACCEPTANCE_CRITERIA.md
   - minimum viable demo checklist
   - must-have features
   - nice-to-have features
   - what to show in the demo
   - what counts as a working submission
   - what can be skipped if time is tight
   - prioritize what matters in an 8-hour hackathon

GLOBAL RULES FOR ALL FILES:
- Be consistent across all documents.
- Use the same exact table names, endpoint names, enum values, and field names everywhere.
- Keep the documents practical for an 8-hour hackathon.
- Prefer simple, robust implementations over fancy but risky ones.
- Use clear markdown headings and tables where useful.
- Make the docs directly usable in a GitHub repository.
- Do not introduce scopes like invoicing, purchasing, payroll, or accounting.
- Do not invent features not mentioned in the AssetFlow brief.
- If a feature is optional or risky for an 8-hour hackathon, mark it as bonus or future scope.
- The system must feel like a clean ERP module, not a toy app.

FIRST OUTPUT REQUIRED:
Start by writing a short “Canonical Decisions” section that freezes:
- the final stack
- the final roles
- the final enums
- the final naming convention
- the final module ownership plan

Then generate all nine markdown files in full.