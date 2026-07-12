# System Architecture

## High-Level Architecture Diagram

```text
┌─────────────────────────┐       ┌──────────────────────────────┐       ┌──────────────────────────┐
│                         │ HTTP  │                              │Prisma │                          │
│   Frontend (React)      ├──────►│   Backend (Node + Express)   ├──────►│   Database (Supabase)    │
│                         │ JSON  │                              │       │                          │
│ • 10 Screens (below)    │◄──────┤ • JWT Auth Middleware         │◄──────┤ • PostgreSQL DB          │
│ • Role-based sidebar    │       │ • Role Authorization          │       │ • Relational Data        │
│ • React Router v6       │       │ • Business Logic Controllers  │       │ • Row Level Constraints  │
│ • Axios HTTP client     │       │ • Validation Middleware        │       │                          │
└─────────────────────────┘       └──────────────────────────────┘       └──────────────────────────┘
```

## Sidebar Navigation (All Screens)

The sidebar is consistent across all authenticated screens and matches the Excalidraw mockup exactly:

```text
┌──────────────────────┐
│  AssetFlow           │
├──────────────────────┤
│  Organization Setup  │  ← Screen 3 (Admin only)
│  Dashboard           │  ← Screen 2
│  Assets              │  ← Screen 4
│  Allocation & Transfer│  ← Screen 5
│  Resource Booking    │  ← Screen 6
│  Maintenance         │  ← Screen 7
│  Audit               │  ← Screen 8
│  Reports             │  ← Screen 9
│  Notifications       │  ← Screen 10
└──────────────────────┘
```

## Data Flow: React → Express → Prisma → Supabase

1. **User Action:** User initiates an action on the React Frontend (e.g., approving a maintenance request on Screen 7).
2. **Frontend Request:** React compiles a JSON payload and makes an HTTP request via Axios to the Express Backend. It attaches the `Authorization: Bearer <token>` header.
3. **Backend Middleware:** Express router intercepts the request. The auth middleware verifies the JWT and attaches `req.user` (id, role, status).
4. **Role Authorization:** A role-check middleware verifies `req.user.role` against the endpoint's required roles (e.g., `ASSET_MANAGER` for maintenance approval).
5. **Validation:** Input validation middleware checks the request body schema.
6. **Controller Logic:** The controller executes business logic (e.g., checks asset status allows the transition, validates no double-allocation).
7. **Database Query:** The controller calls Prisma Client methods to fetch, insert, or update records.
8. **Side Effects:** Controller triggers side effects — creates `Notification` and `ActivityLog` records.
9. **Database Response:** Prisma returns parsed JavaScript objects.
10. **Backend Response:** Express formats the response per the standard API payload format and sends JSON.
11. **Frontend Update:** React receives data and updates local state/UI.

## Module Boundaries

The system is divided into **four functional modules**, each mapping to specific screens:

| Module | Screens | Tables Owned | Key Responsibilities |
|--------|---------|-------------|---------------------|
| **1. Identity & Foundation** | Screen 1 (Login/Signup), Screen 3 (Org Setup) | `User`, `Department`, `AssetCategory` | JWT auth, role management, org master data |
| **2. Asset Core** | Screen 4 (Asset Directory), Screen 5 (Allocation & Transfer) | `Asset`, `Allocation`, `Transfer` | Asset lifecycle, double-allocation prevention, transfer workflows |
| **3. Operations** | Screen 6 (Resource Booking), Screen 7 (Maintenance) | `Booking`, `MaintenanceRequest` | Calendar booking with overlap validation, Kanban maintenance workflow |
| **4. Intelligence** | Screen 2 (Dashboard), Screen 8 (Audit), Screen 9 (Reports), Screen 10 (Notifications & Logs) | `AuditCycle`, `AuditItem`, `Notification`, `ActivityLog` | KPI aggregation, audit cycles, analytics, activity trail |

## Request Lifecycle

```text
1. Authentication (Middleware)     → Validates JWT, attaches req.user
2. Authorization (Middleware)      → Verifies req.user.role ∈ allowedRoles
3. Validation (Middleware)         → Validates request body schema
4. Controller                      → Executes business logic
5. Prisma / Service                → Database read/write
6. Side Effects (Controller)       → Creates Notifications + ActivityLog entries
7. Response                        → Sends structured JSON to client
```

## Module Dependency Order

To ensure parallel development without blockers, follow this build order:

```text
Tier 1 (Foundation)     → Auth, Departments, Categories
                            Unblocks everything else

Tier 2 (Core Data)      → Users (Employee Directory), Assets
                            Unblocks Operations and Allocations

Tier 3 (Transactions)   → Allocations, Transfers, Bookings, Maintenance
                            Unblocks Intelligence

Tier 4 (Intelligence)   → Audits, Dashboard KPIs, Reports, Notifications, Logs
```

## Backend Architecture

```text
backend/
├── src/
│   ├── config/
│   │   ├── prisma.js              // Prisma client singleton
│   │   ├── jwt.js                 // JWT secret, expiry config
│   │   └── env.js                 // Environment variables
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js     // JWT verification → req.user
│   │   ├── role.middleware.js     // Role-based access control
│   │   ├── validate.middleware.js // Request body validation
│   │   └── error.middleware.js    // Global error handler
│   │
│   ├── routes/
│   │   ├── auth.routes.js         // /auth/*
│   │   ├── department.routes.js   // /departments/*
│   │   ├── category.routes.js     // /categories/*
│   │   ├── user.routes.js         // /users/*
│   │   ├── asset.routes.js        // /assets/*
│   │   ├── allocation.routes.js   // /allocations/*
│   │   ├── transfer.routes.js     // /transfers/*
│   │   ├── booking.routes.js      // /bookings/*
│   │   ├── maintenance.routes.js  // /maintenance-requests/*
│   │   ├── audit.routes.js        // /audits/*
│   │   ├── dashboard.routes.js    // /dashboard/*
│   │   ├── report.routes.js       // /reports/*
│   │   ├── notification.routes.js // /notifications/*
│   │   └── activityLog.routes.js  // /activity-logs/*
│   │
│   ├── controllers/               // One controller per route file
│   ├── services/                   // Shared business logic
│   ├── utils/
│   │   ├── createLog.js           // Shared ActivityLog helper
│   │   ├── createNotification.js  // Shared Notification helper
│   │   └── assetTagGenerator.js   // AF-XXXX auto-generation
│   │
│   └── validators/                 // Joi/Zod schemas per route
│
├── prisma/
│   └── schema.prisma
│
└── server.js
```

## Frontend Architecture

```text
frontend/
├── src/
│   ├── api/
│   │   └── axios.js               // Axios instance with base URL + JWT interceptor
│   │
│   ├── context/
│   │   └── AuthContext.jsx         // currentUser state, login/logout
│   │
│   ├── components/
│   │   ├── Sidebar.jsx
│   │   ├── KPICard.jsx
│   │   ├── DataTable.jsx
│   │   ├── FilterBar.jsx
│   │   ├── Modal.jsx
│   │   └── NotificationBell.jsx
│   │
│   ├── pages/
│   │   ├── Login/                  // Screen 1
│   │   ├── Dashboard/              // Screen 2
│   │   ├── OrganizationSetup/      // Screen 3 (tabs)
│   │   ├── Assets/                 // Screen 4
│   │   ├── AllocationTransfer/     // Screen 5
│   │   ├── ResourceBooking/        // Screen 6
│   │   ├── Maintenance/            // Screen 7 (Kanban)
│   │   ├── Audit/                  // Screen 8
│   │   ├── Reports/                // Screen 9
│   │   └── Notifications/          // Screen 10
│   │
│   ├── layouts/
│   │   └── DashboardLayout.jsx     // Sidebar + content area
│   │
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useFetch.js
│   │
│   └── App.jsx                     // React Router v6 routes
│
└── index.html
```
