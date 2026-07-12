# System Architecture - AssetFlow

## Project Overview

AssetFlow is an Enterprise Asset & Resource Management System that allows organizations to manage physical assets, employee allocations, shared resource bookings, maintenance workflows, audit cycles, and analytics through a centralized platform.

---

# Tech Stack

## Frontend
- React
- React Router
- Axios
- Tailwind CSS

## Backend
- Node.js
- Express.js
- JWT Authentication
- Bcrypt

## Database
- Supabase (PostgreSQL)

## ORM
- Prisma

## Version Control
- Git + GitHub

---

# High Level Architecture

```
                           React Frontend
                                  │
                                  │ REST API
                                  ▼
                       Express.js Backend
                                  │
          ┌───────────────┬───────────────┐
          │               │               │
      Authentication   Business Logic   Dashboard
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
│
├── src/
│
├── config/
│   ├── prisma.js
│   ├── jwt.js
│   └── env.js
│
├── middleware/
│   ├── auth.middleware.js
│   ├── role.middleware.js
│   └── error.middleware.js
│
├── routes/
│   ├── auth.routes.js
│   ├── employee.routes.js
│   ├── department.routes.js
│   ├── asset.routes.js
│   ├── allocation.routes.js
│   ├── booking.routes.js
│   ├── maintenance.routes.js
│   ├── audit.routes.js
│   ├── dashboard.routes.js
│   └── notification.routes.js
│
├── controllers/
│
├── services/
│
├── repositories/
│
├── utils/
│
├── validators/
│
├── prisma/
│   └── schema.prisma
│
└── server.js
```

---

# Frontend Architecture

```
frontend/
│
├── src/
│
├── api/
│
├── components/
│
├── pages/
│   ├── Login
│   ├── Dashboard
│   ├── Assets
│   ├── Allocation
│   ├── Booking
│   ├── Maintenance
│   ├── Audit
│   ├── Reports
│   └── Notifications
│
├── layouts/
│
├── hooks/
│
├── context/
│
└── App.jsx
```

---

# Core Modules

## Authentication

Responsible for

- Login
- Signup
- JWT generation
- Password hashing
- Role Based Access Control

Roles

- Admin
- Asset Manager
- Department Head
- Employee

---

## Organization Management

Manages

- Departments
- Employee Directory
- Role Assignment

---

## Asset Management

Responsible for

- Asset Categories
- Asset Registration
- Asset Status
- Asset History
- Asset Search

---

## Allocation Management

Responsible for

- Allocate Assets
- Return Assets
- Transfer Requests
- Allocation History

Business Rule

- One asset cannot be allocated to multiple employees simultaneously.

---

## Booking Management

Responsible for

- Shared Resource Booking
- Time Slot Validation
- Calendar View
- Booking Status

Business Rule

- Overlapping bookings are not allowed.

---

## Maintenance Management

Responsible for

- Raise Maintenance Request
- Approval Workflow
- Technician Assignment
- Maintenance History

Workflow

```
Pending
    │
Approved
    │
Assigned
    │
In Progress
    │
Resolved
```

---

## Audit Management

Responsible for

- Audit Cycles
- Auditor Assignment
- Asset Verification
- Discrepancy Reports

---

## Dashboard

Displays

- Available Assets
- Allocated Assets
- Active Bookings
- Pending Transfers
- Maintenance Requests
- Upcoming Returns

---

## Notifications

Responsible for

- Asset Assigned
- Transfer Approved
- Booking Reminder
- Maintenance Approved
- Overdue Return Alerts
- Audit Notifications

---

# Database Modules

```
Department
        │
        ▼
Employee
        │
        ▼
Asset Allocation
        ▲
        │
Asset
        │
        ├───────────────┐
        │               │
        ▼               ▼
Booking        Maintenance
        │               │
        ▼               ▼
Notifications  Audit
```

---

# Request Flow

```
React

    │

Axios

    │

Express Router

    │

Controller

    │

Service

    │

Prisma ORM

    │

Supabase PostgreSQL

    │

Response

    │

React UI
```

---

# Development Phases

## Phase 1

Planning

- Read problem statement
- Design database
- Define APIs
- Create Git repository

---

## Phase 2

Foundation

- Authentication
- Database schema
- React layout
- Prisma setup

---

## Phase 3

Core Modules

- Departments
- Employees
- Categories
- Assets

---

## Phase 4

Business Modules

- Asset Allocation
- Transfers
- Resource Booking
- Maintenance

---

## Phase 5

Analytics

- Dashboard
- Notifications
- Reports
- Audit

---

## Phase 6

Integration

- Frontend ↔ Backend
- API Testing
- Bug Fixes

---

## Phase 7

Final Polish

- UI Improvements
- Demo Preparation
- Presentation
- Final Git Push

---

# Team Responsibilities

## Member 1

Authentication & User Management

- Login
- Signup
- JWT
- Roles
- Departments
- Employees

---

## Member 2

Asset Management

- Categories
- Assets
- Allocation
- Transfers

---

## Member 3

Operations

- Bookings
- Maintenance
- Notifications
- Audit

---

## Member 4

Frontend

- React UI
- Dashboard
- API Integration
- Reports
- Testing

---

# Git Branch Strategy

```
main

develop

feature/auth

feature/assets

feature/operations

feature/frontend
```

Pull Requests should always target **develop**.

Merge into **main** only after successful integration and testing.

---

# Design Principles

- Modular architecture
- Separation of concerns
- RESTful API design
- Role-based authorization
- Reusable services
- Validation before database operations
- Centralized error handling
- Maintainable folder structure
- Scalable database schema
- Clean Git workflow
