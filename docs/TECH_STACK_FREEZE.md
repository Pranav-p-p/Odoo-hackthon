# Tech Stack Freeze

This document defines the strictly frozen technology stack for the AssetFlow hackathon project. No deviations are allowed without unanimous team agreement.

---

## Approved Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend Library** | React (Functional Components + Hooks) | v18+ |
| **Routing** | React Router | v6+ |
| **Styling** | CSS Modules or Tailwind CSS (choose one globally) | — |
| **HTTP Client** | Axios | — |
| **Backend Framework** | Node.js + Express.js | Node v18+ / v20+ LTS |
| **Database** | Supabase (PostgreSQL) | — |
| **ORM** | Prisma | v5+ |
| **Authentication** | Custom JWT (JSON Web Tokens) | — |
| **Password Hashing** | bcrypt | — |
| **Date/Time** | date-fns or dayjs (choose one globally) | — |

---

## Additional Libraries (Approved for Specific Screens)

| Library | Purpose | Used By |
|---------|---------|---------|
| `recharts` or `chart.js` | Charts for Reports (Screen 9) and Dashboard KPI (Screen 2) | Member 4 |
| `react-big-calendar` or custom calendar component | Calendar/timeline view for Resource Booking (Screen 6) | Member 3 |
| `lucide-react` or `react-icons` | Standard dashboard iconography | All |
| `cors` | CORS middleware | Member 1 (backend setup) |
| `jsonwebtoken` | JWT sign/verify | Member 1 |
| `bcrypt` | Password hashing | Member 1 |

> **Rule:** If a simpler approach works (e.g., a CSS grid calendar instead of `react-big-calendar`), prefer the simpler approach. Only add a library if it saves significant time.

---

## Tools and Libraries NOT ALLOWED (Discouraged)

| Tool | Reason |
|------|--------|
| **Redux / MobX** | Overkill for an 8-hour hackathon. Use React Context or simple state lifting. |
| **GraphQL** | Sticking strictly to REST to simplify debugging and keep the API contract clear. |
| **External OAuth (Google/GitHub Auth)** | Stick to simple Email/Password for deterministic testing. |
| **Microservices** | Everything must be in a single monolithic Express backend. |
| **NoSQL Databases** | Relational integrity is mandatory for ERP systems. |
| **Heavy drag-and-drop libraries** | Use simple button-click actions for the Kanban board (Screen 7) unless time permits. |
| **Next.js / SSR** | Client-side React only. No server-side rendering complexity. |

---

## Rules Against Changing the Stack

1. **Do not introduce new libraries** without checking if a standard approach works first.
2. **Do not change database providers** midway. Supabase is final.
3. **Do not eject or switch build tools.** If using Vite, stay on Vite.
4. **Do not add TypeScript midway.** Start with it or don't use it — no partial migration.

---

## One-Line Responsibility Per Member

| Member | Screen Ownership | One-Line Responsibility |
|--------|-----------------|------------------------|
| **Member 1** | Screen 1, Screen 3 | Build secure Auth with JWT, setup organization config (Departments with hierarchy, Categories), and manage employee role promotion and status. |
| **Member 2** | Screen 4, Screen 5 | Build the Asset directory with search/filter, registration flows, and handle allocation with double-allocation blocking and transfer workflows. |
| **Member 3** | Screen 6, Screen 7 | Build the calendar-based resource booking system with overlap validation and the Kanban maintenance request/approval lifecycle. |
| **Member 4** | Screen 2, 8, 9, 10 | Build the KPI dashboard, audit cycle workflows, reports/analytics panels, and system-wide notifications and activity logs. |

---

## What Each Member Must Use

| Member | Must Use |
|--------|---------|
| All | Axios for HTTP, Prisma for DB, JWT for auth, shared `createLog()` + `createNotification()` utilities |
| Member 1 | `bcrypt`, `jsonwebtoken`, `cors` — sets up the Express server and middleware stack |
| Member 2 | Member 1's auth middleware, Member 4's logging/notification utilities |
| Member 3 | Member 1's auth middleware, Member 2's asset list endpoint, Member 4's logging/notification utilities, calendar library (if using one) |
| Member 4 | Member 1's auth middleware, charting library (`recharts` or `chart.js`), aggregation queries across all tables |
