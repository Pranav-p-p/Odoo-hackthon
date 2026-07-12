# How to Use These Control Docs During Your Hackathon

### 🏁 Before You Start Coding (Hour 0 — All 4 Members)

Every member reads these 3 files first:

- [SHARED_ENUMS.md](file:///d:/projects/Odoo-hackthon/docs/SHARED_ENUMS.md) — this is your single source of truth for every enum, status, and constant. If you're writing a dropdown, a status check, or a validation — copy values from here exactly.
- [ROLE_DISTRIBUTION.md](file:///d:/projects/Odoo-hackthon/docs/ROLE_DISTRIBUTION.md) — find your member number (1–4), see what screens you own, what files you touch, and what you must NOT touch.
- [GIT_WORKFLOW.md](file:///d:/projects/Odoo-hackthon/docs/GIT_WORKFLOW.md) — branch naming, commit prefixes, and the ownership table.

**Member 1 reads additionally:**
- [TECH_STACK_FREEZE.md](file:///d:/projects/Odoo-hackthon/docs/TECH_STACK_FREEZE.md) — because they set up the project scaffold.

### 🔧 While Coding (Hours 0.5–7)

Each file serves a specific purpose during development:

| When you need to... | Open this file |
|---|---|
| **Write a Prisma model** | [DATABASE_SCHEMA.md](file:///d:/projects/Odoo-hackthon/docs/DATABASE_SCHEMA.md) — copy the exact model definitions |
| **Build an API endpoint** | [API_CONTRACT.md](file:///d:/projects/Odoo-hackthon/docs/API_CONTRACT.md) — gives you the exact method, path, request body, response shape, and error codes |
| **Build a frontend page** | [WORKFLOW.md](file:///d:/projects/Odoo-hackthon/docs/WORKFLOW.md) — tells you step-by-step what the screen does, what API it calls, and what happens on success/error |
| **Check what enum value to use** | [SHARED_ENUMS.md](file:///d:/projects/Odoo-hackthon/docs/SHARED_ENUMS.md) — never hardcode a string without checking this first |
| **Decide what library to use** | [TECH_STACK_FREEZE.md](file:///d:/projects/Odoo-hackthon/docs/TECH_STACK_FREEZE.md) — if it's not on the approved list, don't use it |
| **Know if you can edit a file** | [GIT_WORKFLOW.md](file:///d:/projects/Odoo-hackthon/docs/GIT_WORKFLOW.md) — check the ownership tables |
| **Understand the full architecture** | [SYSTEM_ARCHITECTURE.md](file:///d:/projects/Odoo-hackthon/docs/SYSTEM_ARCHITECTURE.md) — folder structure, module boundaries, data flow |
| **Track progress & check blockers** | [IMPLEMENTATION_TRACKER.md](file:///d:/projects/Odoo-hackthon/docs/IMPLEMENTATION_TRACKER.md) — update this when you finish a feature or merge a PR |

### 🧑‍🤝‍🧑 Per-Member Workflow

**Member 1 (Identity & Foundation):**
1. Read `DATABASE_SCHEMA.md` → copy the User, Department, AssetCategory models into schema.prisma
2. Read `API_CONTRACT.md` → Module 1 section → build auth + dept + category + user routes
3. Read `WORKFLOW.md` → Sections 1, 3 → build Login/Signup + Org Setup UI
4. At Hour 2: push auth middleware → tell team "auth is ready, pull dev"

**Member 2 (Asset Core):**
1. Wait for Member 1's schema push (Hour 0.5)
2. Read `DATABASE_SCHEMA.md` → copy Asset, Allocation, Transfer models
3. Read `API_CONTRACT.md` → Module 2 section → build asset + allocation + transfer routes
4. Read `WORKFLOW.md` → Sections 4, 5 → build Asset Directory + Allocation UI
5. **KEY:** Read the 409 conflict response shape for double-allocation — it's in the API contract

**Member 3 (Operations):**
1. Wait for Member 1's schema push (Hour 0.5)
2. Read `DATABASE_SCHEMA.md` → copy Booking, MaintenanceRequest models
3. Read `API_CONTRACT.md` → Module 3 section → build booking + maintenance routes
4. Read `WORKFLOW.md` → Sections 6, 7 → build Calendar Booking + Maintenance Kanban UI
5. **KEY:** The overlap validation SQL query is in `WORKFLOW.md` Section 6

**Member 4 (Intelligence):**
1. **FIRST:** Build `createLog()` and `createNotification()` utilities (Hour 0.5–1)
2. Share them with Members 1, 2, 3 so they can call them in their controllers
3. Read `API_CONTRACT.md` → Module 4 section → build dashboard, audit, report, notification routes
4. Read `WORKFLOW.md` → Sections 2, 8, 9, 10 → build Dashboard + Audit + Reports + Notifications UI

### 🔄 At Integration Checkpoints

These are defined in [ROLE_DISTRIBUTION.md](file:///d:/projects/Odoo-hackthon/docs/ROLE_DISTRIBUTION.md):

| Hour | Action | Who |
|------|--------|-----|
| **0.5** | Member 1 pushes Prisma schema to `dev`. Everyone pulls + runs `npx prisma generate` | All |
| **2.0** | Member 1 merges auth. Member 4 merges utilities. Everyone pulls `dev` | All |
| **4.0** | All backend branches merged to `dev`. Quick smoke test | All |
| **5.5** | All frontend branches merged. Cross-screen navigation test | All |
| **7.0** | Feature freeze. Bug fixes only | All |
| **7.5** | Final merge to `main`. Rehearse demo | All |

### 🎤 For the Demo (Hour 7.5–8)

Open [ACCEPTANCE_CRITERIA.md](file:///d:/projects/Odoo-hackthon/docs/ACCEPTANCE_CRITERIA.md) and follow the **Demo Script Strategy** at the bottom. It's a 4-act script:
- **Act 1** — Login as Admin → set up dept + category → promote a user
- **Act 2** — Login as Asset Manager → register asset → allocate → show double-allocation block
- **Act 3** — Login as Employee → book a room → double-book (show rejection) → raise maintenance → approve it (show auto-status change)
- **Act 4** — Show Dashboard KPIs reflect everything → audit + reports + notifications (if done)

### ⚠️ Golden Rules

1. **Never invent an enum value.** Always copy from `SHARED_ENUMS.md`.
2. **Never guess an API shape.** Always check `API_CONTRACT.md`.
3. **Never edit another member's files** without talking to them. Check the ownership tables in `GIT_WORKFLOW.md`.
4. **If you change an API response shape**, update `API_CONTRACT.md` immediately.
5. **If you need to change `schema.prisma`**, announce to the team — one person applies and pushes.
6. **Frontend devs: mock data from `API_CONTRACT.md`** until the backend endpoint is live. Don't wait.
7. **Always update the tracker.** Check off completed tasks in [IMPLEMENTATION_TRACKER.md](file:///d:/projects/Odoo-hackthon/docs/IMPLEMENTATION_TRACKER.md) when you merge to `dev`.
