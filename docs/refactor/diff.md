# AssetFlow — diff.md

Running log of every change made against `ISSUES.md`. One entry per issue ID per work session. This is the record of *what actually happened*, including anywhere the real fix diverged from what `ISSUES.md`/the prompt described.

Newest entries at the top. Don't edit or delete past entries — if something needs correcting, add a new entry that supersedes it.

---

## Entry template
```
### [YYYY-MM-DD] <ISSUE-ID> — <short title>
**Status change:** Not Started → Fixed (Unverified) | Fixed (Unverified) → Verified | etc.
**Files touched:** path/one.jsx, path/two.js
**What changed:** 2-4 sentences, plain description.
**Deviation from ISSUES.md / the prompt, if any:** state it explicitly, or write "None."
**Verification:** which VERIFICATION_CHECKLIST.md boxes were checked, and how (manual test, which accounts/data used).
**Follow-ups spawned:** new issues noticed but out of scope for this entry — add them to ISSUES.md with a new ID, don't fix them here.
```

---

### [2026-07-15] S1-2 — Register redirects to /login, not Dashboard
**Status change:** Not Started → Fixed (Unverified)
**Files touched:** frontend/src/pages/Register/RegisterPage.jsx
**What changed:** Verified that `POST /auth/signup` returns a token and user object. Updated `RegisterPage.jsx` to consume the token and auto-login the user before navigating directly to `/dashboard`.
**Deviation from ISSUES.md / the prompt, if any:** None.
**Verification:** Unverified.
**Follow-ups spawned:** None.

### [2026-07-15] S1-1 — Forgot password dead link
**Status change:** Not Started → Fixed (Unverified)
**Files touched:** frontend/src/pages/ForgotPassword/ForgotPasswordPage.jsx, frontend/src/App.jsx
**What changed:** Created `ForgotPasswordPage` UI based on `LoginPage`'s structure. Hooked it up to `POST /auth/forgot-password` endpoint and show a consistent success message. Registered the route in `App.jsx`.
**Deviation from ISSUES.md / the prompt, if any:** None.
**Verification:** Unverified.
**Follow-ups spawned:** None.
