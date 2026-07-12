<div align="center">
  <h1>🚀 AssetFlow</h1>
  <p><b>Enterprise Asset & Resource Management System</b></p>
</div>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge" alt="Express" />
  <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
</p>

## 📖 About

**AssetFlow** is an ERP-style workflow system for organizations that manage physical assets and shared resources. Built specifically for an 8-hour hackathon, this platform ensures end-to-end management of departments, physical assets, maintenance workflows, and audit cycles with a robust role-based access control (RBAC) architecture.

Unlike generic CRUD applications, AssetFlow prevents conflicts like double-allocations and booking overlaps, driving operational efficiency through structured approvals.

---

## ✨ Key Features

- 🔐 **Role-Based Access Control:** Distinct workflows for `Admin`, `Asset Manager`, `Department Head`, and standard `Employee`.
- 🏢 **Organization Management:** Multi-level department hierarchies and comprehensive employee directory.
- 📦 **Asset Core & Tracking:** End-to-end asset lifecycle management (Available → Allocated → Maintenance → Disposed).
- 🔄 **Smart Allocations & Transfers:** Built-in conflict prevention preventing double-allocation of a single asset.
- 📅 **Resource Booking:** Calendar-based shared resource booking with automated overlap rejection.
- 🛠 **Maintenance Kanban:** 6-step Kanban approval workflow for maintenance requests (Pending → Approved → Technician Assigned → In Progress → Resolved).
- 📋 **Audit Cycles:** Automated audit creation, discrepancy reporting, and resolution workflows.
- 📊 **Intelligence & Analytics:** Live KPI dashboard, utilization reports, booking heatmaps, and system-wide activity logs.

---

## 🛠 Tech Stack

- **Frontend:** React.js (Hooks & Context API), React Router v6, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** Supabase (PostgreSQL)
- **ORM:** Prisma v5+
- **Authentication:** Custom JWT (JSON Web Tokens) with bcrypt for password hashing
- **Data Visualization:** Recharts

---

## 📂 Project Structure

The project is structured as a full-stack monorepo:

```text
AssetFlow/
├── backend/                  # Node/Express API
│   ├── prisma/               # Database Schema
│   ├── src/
│   │   ├── config/           # Setup & Env Configurations
│   │   ├── controllers/      # Route logic
│   │   ├── middleware/       # JWT Auth & Validation
│   │   ├── routes/           # Express routers
│   │   ├── services/         # Shared business logic
│   │   └── utils/            # Shared utilities (logs, notifications)
│   └── server.js
│
├── frontend/                 # React SPA
│   ├── src/
│   │   ├── api/              # Axios instances & interceptors
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # React Context (Auth)
│   │   ├── layouts/          # Dashboard layouts & Sidebar
│   │   └── pages/            # View components (Mapped to 10 screens)
│
└── docs/                     # 📚 System Architecture & Control Documents
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ or v20+ LTS)
- NPM or Yarn
- Supabase project (PostgreSQL)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd AssetFlow
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```env
PORT=5000
DATABASE_URL="postgresql://user:password@aws-0-region.pooler.supabase.com:6543/postgres"
JWT_SECRET="your_jwt_secret_key"
```

Run database migrations:
```bash
npx prisma generate
npx prisma db push
```

Start the backend development server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend` directory:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Start the frontend development server:
```bash
npm run dev
```

---

## 📚 Documentation

For deeper technical context, check the `/docs` directory:
- [System Architecture](./docs/SYSTEM_ARCHITECTURE.md)
- [API Contract](./docs/API_CONTRACT.md)
- [Database Schema](./docs/DATABASE_SCHEMA.md)
- [Tech Stack Freeze](./docs/TECH_STACK_FREEZE.md)
- [Workflow definitions](./docs/WORKFLOW.md)

---
<div align="center">
  <i>Built with ❤️ during the Hackathon</i>
</div>
