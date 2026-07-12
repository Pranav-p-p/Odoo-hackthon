# Git Workflow & Rules

Because this is an 8-hour hackathon, we prioritize speed and safety. Strict adherence to these rules prevents catastrophic merge conflicts.

## Branch Strategy

*   **`main`**: Production-ready branch. Deploys automatically.
*   **`dev`**: The primary integration branch.
*   **Feature Branches**: Branch off `dev` using the format `feature/<module>-<description>`.
    *   *Example:* `feature/auth-login`, `feature/asset-registration`, `feature/booking-calendar`

## Commit Message Style

Keep commits atomic and descriptive. Prefix with the module:
*   `[AUTH] Add JWT middleware validation`
*   `[ASSET] Create asset POST endpoint`
*   `[OPS] Fix booking overlap logic`
*   `[UI] Build dashboard KPI cards`

## PR / Merge Rules

1. **No direct pushes to `main` or `dev`**.
2. All feature branches must be merged into `dev` via Pull Request.
3. **Fast Reviews:** Since it's a hackathon, require exactly 1 approval from another team member before merging. Do not block for hours.
4. Delete branches after merging.

## Ownership Rules (Avoiding Conflicts)

*   **Member 1** owns `/routes/auth.js`, `/routes/departments.js`.
*   **Member 2** owns `/routes/assets.js`, `/routes/allocations.js`.
*   **Member 3** owns `/routes/bookings.js`, `/routes/maintenance.js`.
*   **Member 4** owns `/routes/audits.js`, `/routes/dashboard.js`.
*   Do NOT edit another member's route file without speaking to them physically/on a call first.

## Prisma Schema Rules

*   The `schema.prisma` file is a major source of conflicts.
*   **Rule:** If you need to change `schema.prisma`, you MUST announce it to the team.
*   Only ONE person should push schema changes and run `npx prisma migrate dev` to generate the migration.
*   Once pushed, all other members must pull `dev` and run `npx prisma generate` locally.

## Frontend / Backend Synchronization

*   If you change an API request/response shape, you must update `docs/API_CONTRACT.md` immediately.
*   Frontend developers must mock data based exactly on the `API_CONTRACT.md` until the backend endpoint is ready. This allows parallel work.
