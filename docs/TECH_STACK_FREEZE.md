# Tech Stack Freeze

This document defines the strictly frozen technology stack for the AssetFlow hackathon project. No deviations are allowed without unanimous team agreement.

## Approved Stack

*   **Frontend Library:** React (Functional Components + Hooks)
*   **Routing:** React Router v6
*   **Styling:** CSS Modules or Tailwind CSS (Choose one and stick to it globally)
*   **Backend Framework:** Node.js + Express.js
*   **Database:** Supabase (PostgreSQL)
*   **ORM:** Prisma
*   **Authentication:** Custom JWT (JSON Web Tokens)
*   **Date/Time Handling:** date-fns or dayjs

## Exact Tools and Libraries Encouraged

*   `axios` for frontend HTTP requests.
*   `cors`, `express`, `jsonwebtoken`, `bcrypt` for backend auth and routing.
*   `lucide-react` or `react-icons` for standard dashboard iconography.

## Tools and Libraries NOT ALLOWED (Discouraged)

*   **Complex State Management (Redux, MobX):** Overkill for this 8-hour hackathon. Use React Context or simple state lifting instead.
*   **GraphQL:** Sticking strictly to REST to simplify debugging.
*   **External OAuth Providers (Google/GitHub Auth):** Stick to simple Email/Password to guarantee deterministic testing.
*   **Microservices:** Everything must be in a single monolithic Express backend.
*   **NoSQL Databases:** Relational integrity is mandatory for ERP systems.

## Version Assumptions

*   **Node.js:** v18+ or v20+ (LTS)
*   **React:** v18+
*   **Prisma:** v5+

## Rules Against Changing the Stack

1. **Do not introduce new libraries** without checking if a standard approach works first.
2. **Do not change database providers** midway. Supabase is final.
3. **Do not eject or switch build tools.** If using Vite, stay on Vite.

## One-Line Responsibility Per Member

*   **Member 1 (Identity & Foundation):** Build secure Auth, setup organization configuration (Departments/Categories), and manage employee role elevations.
*   **Member 2 (Asset Core):** Build the Asset directory, registration flows, and handle the logic for allocating and transferring physical assets.
*   **Member 3 (Operations):** Build the calendar-based resource booking system and the maintenance request/approval lifecycle.
*   **Member 4 (Intelligence):** Build the audit reconciliation workflows, system-wide notifications, activity logs, and the KPI dashboard.
