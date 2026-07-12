# System Architecture - AssetFlow

## Project Overview

AssetFlow is an Enterprise Asset & Resource Management System that allows organizations to manage physical assets, employee allocations, shared resource bookings, maintenance workflows, audit cycles, and analytics through a centralized platform. The system is built around 10 screens defined in the organizer's Excalidraw mockup.

> **Note:** The canonical architecture document is at `docs/SYSTEM_ARCHITECTURE.md`. This file provides a quick-reference summary.

---

# Tech Stack

## Frontend
- React (Functional Components + Hooks)
- React Router v6
- Axios
- CSS Modules or Tailwind CSS
- recharts or chart.js (Reports)
- lucide-react or react-icons

## Backend
- Node.js + Express.js
- JWT Authentication (jsonwebtoken)
- Bcrypt (password hashing)

## Database
- Supabase (PostgreSQL)

## ORM
- Prisma

## Version Control
- Git + GitHub

---

# 10 Screens (from Excalidraw Mockup)

| Screen | Name | Owner |
|--------|------|-------|
| 1 | Login / Signup | Member 1 |
| 2 | Dashboard / Home | Member 4 |
| 3 | Organization Setup (Admin — 3 tabs) | Member 1 |
| 4 | Asset Registration & Directory | Member 2 |
| 5 | Asset Allocation & Transfer | Member 2 |
| 6 | Resource Booking | Member 3 |
| 7 | Maintenance Management (Kanban) | Member 3 |
| 8 | Asset Audit | Member 4 |
| 9 | Reports & Analytics | Member 4 |
| 10 | Activity Logs & Notifications | Member 4 |

---

# High Level Architecture

```
                           React Frontend
                                  │
                                  │ REST API (Axios + JWT)
                                  ▼
                       Express.js Backend
                                  │
          ┌───────────────┬───────────────┐
          │               │               │
      Auth Middleware  Business Logic   Side Effects
      (JWT + Role)    (Controllers)    (Notifications + Logs)
          │               │               │
          └───────────────┴───────────────┘
                                  │
                               Prisma
                                  │
                                  ▼
                     Supabase PostgreSQL Database
```

---

# Backend Architecture

```
backend/
├── src/
│   ├── config/
│   │   ├── prisma.js
│   │   ├── jwt.js
│   │   └── env.js
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── role.middleware.js
│   │   ├── validate.middleware.js
│   │   └── error.middleware.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js              // Member 1
│   │   ├── department.routes.js        // Member 1
│   │   ├── category.routes.js          // Member 1
│   │   ├── user.routes.js              // Member 1
│   │   ├── asset.routes.js             // Member 2
│   │   ├── allocation.routes.js        // Member 2
│   │   ├── transfer.routes.js          // Member 2
│   │   ├── booking.routes.js           // Member 3
│   │   ├── maintenance.routes.js       // Member 3
│   │   ├── audit.routes.js             // Member 4
│   │   ├── dashboard.routes.js         // Member 4
│   │   ├── report.routes.js            // Member 4
│   │   ├── notification.routes.js      // Member 4
│   │   └── activityLog.routes.js       // Member 4
│   │
│   ├── controllers/
│   ├── services/
│   ├── utils/
│   │   ├── createLog.js                // Member 4 (shared)
│   │   ├── createNotification.js       // Member 4 (shared)
│   │   └── assetTagGenerator.js        // Member 2
│   │
│   ├── validators/
│   │
│   └── prisma/
│       └── schema.prisma
│
└── server.js
```

---

# Frontend Architecture

```
frontend/
├── src/
│   ├── api/
│   │   └── axios.js
│   │
│   ├── context/
│   │   └── AuthContext.jsx
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
│   │   ├── Login/                  // Screen 1 — Member 1
│   │   ├── Dashboard/              // Screen 2 — Member 4
│   │   ├── OrganizationSetup/      // Screen 3 — Member 1
│   │   ├── Assets/                 // Screen 4 — Member 2
│   │   ├── AllocationTransfer/     // Screen 5 — Member 2
│   │   ├── ResourceBooking/        // Screen 6 — Member 3
│   │   ├── Maintenance/            // Screen 7 — Member 3
│   │   ├── Audit/                  // Screen 8 — Member 4
│   │   ├── Reports/                // Screen 9 — Member 4
│   │   └── Notifications/          // Screen 10 — Member 4
│   │
│   ├── layouts/
│   │   └── DashboardLayout.jsx
│   │
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useFetch.js
│   │
│   └── App.jsx
│
└── index.html
```

---

# Core Modules

## Module 1: Identity & Foundation (Member 1)
- Login / Signup (Screen 1)
- JWT generation + validation middleware
- Role-based access control middleware
- Organization Setup (Screen 3): Departments (with hierarchy), Categories, Employee Directory

## Module 2: Asset Core (Member 2)
- Asset Registration & Directory (Screen 4): categories, tags, search/filter, detail view
- Allocation & Transfer (Screen 5): allocate, double-allocation block, transfer, return with condition

## Module 3: Operations (Member 3)
- Resource Booking (Screen 6): calendar view, overlap validation
- Maintenance (Screen 7): Kanban board, priority, technician assignment, auto-status updates

## Module 4: Intelligence (Member 4)
- Dashboard (Screen 2): KPI cards, overdue alerts, quick actions, recent activity
- Audit (Screen 8): cycles, checklists, discrepancy reports
- Reports (Screen 9): charts, analytics, export
- Notifications & Logs (Screen 10): categorized notifications, activity timeline

---

# User Roles

| Role | Key Permissions |
|------|----------------|
| Admin | Manages departments, categories, audit cycles, role promotion, org-wide analytics |
| Asset Manager | Registers/allocates assets, approves transfers/maintenance/returns |
| Department Head | Views department assets, approves dept requests, books for department |
| Employee | Views allocated assets, books resources, raises maintenance requests |

---

# Request Flow

```
React → Axios → Express Router → Auth Middleware → Role Middleware →
Validation → Controller → Service → Prisma ORM → Supabase PostgreSQL →
Response → Side Effects (Notifications + Logs) → React UI
```

---

# Development Phases (8-Hour Timeline)

| Phase | Hours | Focus |
|-------|-------|-------|
| 1. Schema & Setup | 0–0.5 | Prisma schema finalized, project scaffold |
| 2. Foundation | 0.5–2 | Auth, JWT middleware, DashboardLayout shell |
| 3. Core APIs | 2–4 | All backend endpoints for Screens 1–7 |
| 4. UI Integration | 4–5.5 | Frontend pages wired to live APIs |
| 5. Intelligence | 5.5–7 | Dashboard, Audit, Reports, Notifications |
| 6. Polish | 7–7.5 | Bug fixes, demo prep |
| 7. Demo | 7.5–8 | Final build, rehearsal |

---

# Design Principles

- Modular architecture (4 isolated modules)
- Separation of concerns (routes → controllers → services → Prisma)
- RESTful API design with consistent response format
- Role-based authorization at middleware level
- Reusable shared utilities (createLog, createNotification)
- Validation before database operations
- Centralized error handling
- Clean sidebar navigation matching Excalidraw mockup
- Scalable database schema with proper indexes
- Clean Git workflow with file ownership
