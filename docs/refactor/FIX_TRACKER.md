# AssetFlow — Fix Tracker

Live status board. Source of truth for *what each issue is* lives in `ISSUES.md` — this file only tracks *status*. Only actionable items (⚠️/❌ from `ISSUES.md`) are listed; ✅ items need no tracking.

**Status values:** `Not Started` · `In Progress` · `Fixed (Unverified)` · `Verified` · `Deferred` · `Not Reproducible`

Rules:
- Move an item to `Fixed (Unverified)` only after the code change is made. Move it to `Verified` only after it passes its checklist entry in `VERIFICATION_CHECKLIST.md` — these are two different states, don't skip straight to `Verified`.
- Every status change gets a matching entry in `diff.md` with the date and a one-line reason.
- `Deferred` requires a reason (write it in the Notes column). `Not Reproducible` requires the same, plus what you actually checked.

---

## Currently active scope: **Screen 1**
Only S1-1 and S1-2 are in scope for this pass. Everything else stays `Not Started` until its screen comes up.

| ID | Priority | Description | Status | Notes |
|---|---|---|---|---|
| S1-1 | High | Forgot password dead link — no route/page | Fixed (Unverified) | |
| S1-2 | Low | Register redirects to /login, not Dashboard | Fixed (Unverified) | |

---

## Backlog (not in scope yet — do not touch until instructed)

### Root causes
| ID | Priority | Description | Status | Notes |
|---|---|---|---|---|
| ROOT-1 | Critical | createLog/createNotification calling-convention mismatch | Not Started | Affects S4-1, S5-1, S5-2, S8-1, S10-1 |
| ROOT-2 | Critical | 4x duplicated current-user reading, 2 broken | Not Started | Affects S5-3 |

### Screen 2 — Dashboard
| ID | Priority | Description | Status | Notes |
|---|---|---|---|---|
| S2-1 | Medium | "Maintenance Today" KPI formula wrong | Not Started | |
| S2-2 | Low-Medium | "Upcoming Returns" undocumented 7-day cap | Not Started | |
| S2-3 | Medium-High | "Active Bookings" KPI effectively always 0 | Not Started | Needs a real status-transition mechanism, not just a query fix |
| S2-4 | Low-Medium | Quick Actions don't match spec | Not Started | |

### Screen 3 — Organization Setup
| ID | Priority | Description | Status | Notes |
|---|---|---|---|---|
| S3-1 | Medium-High | Department edit/deactivate — no UI | Not Started | |
| S3-2 | Medium | Head/Parent Dept — raw UUID text inputs | Not Started | |
| S3-3 | Medium | Category edit — no UI | Not Started | Fix S3-4 in the same pass |
| S3-4 | Low (fix with S3-3) | PATCH /categories/:id validation bug | Not Started | |

### Screen 4 — Asset Registration & Directory
| ID | Priority | Description | Status | Notes |
|---|---|---|---|---|
| S4-1 | Critical | Register/Update false failure | Not Started | Resolved by fixing ROOT-1 |
| S4-2 | Medium | PATCH /assets/:id allows direct status mutation | Not Started | |

### Screen 5 — Allocation & Transfer
| ID | Priority | Description | Status | Notes |
|---|---|---|---|---|
| S5-1 | Critical | Allocate/Return false failure | Not Started | Resolved by fixing ROOT-1 |
| S5-2 | Critical | Transfer approve/reject false failure | Not Started | Resolved by fixing ROOT-1 |
| S5-3 | High | Pending Transfers tab invisible w/o "Remember me" | Not Started | Resolved by fixing ROOT-2 |

### Screen 6 — Resource Booking
| ID | Priority | Description | Status | Notes |
|---|---|---|---|---|
| S6-1 | Low | Tailwind light-theme classes on 2 elements | Not Started | |
| S6-2 | Low-Medium | Silent mock fallback on empty real result | Not Started | |
| S6-3 | Low | Dead validator in createBooking schema | Not Started | Cleanup only, no functional impact |

### Screen 7 — Maintenance
| ID | Priority | Description | Status | Notes |
|---|---|---|---|---|
| S7-1 | High | Assign Technician fully non-functional (hardcoded mock) | Not Started | |

### Screen 8 — Asset Audit
| ID | Priority | Description | Status | Notes |
|---|---|---|---|---|
| S8-1 | Critical | All mutating audit actions crash | Not Started | Resolved by fixing ROOT-1 |
| S8-2 | Medium | AuditPage swallows all errors silently | Not Started | Fix alongside S8-1 |
| S8-3 | Medium | Schema supports only 1 auditor, spec wants "one or more" | Not Started | Needs migration — confirm scope before starting |

### Screen 9 — Reports & Analytics
| ID | Priority | Description | Status | Notes |
|---|---|---|---|---|
| S9-1 | Medium | Maintenance frequency fetched, never rendered | Not Started | |
| S9-2 | Medium | Department allocation summary fetched, never rendered | Not Started | |

### Screen 10 — Activity Logs & Notifications
| ID | Priority | Description | Status | Notes |
|---|---|---|---|---|
| S10-1 | — | Incomplete data | Not Started | Auto-resolved by fixing ROOT-1, no separate work |
| S10-2 | Medium | Dept/Category/User changes never log at all | Not Started | |

### Cross-cutting
| ID | Priority | Description | Status | Notes |
|---|---|---|---|---|
| X-1 | Medium | /components-test unguarded public route | Not Started | |
| X-2 | Low | App.css dead boilerplate | Not Started | |
| X-3 | Low | Architecture drift from SYSTEM_ARCHITECTURE.md | Not Started | Informational — don't restructure unasked |
| X-4 | Low | No DB-level unique constraint on double-allocation | Not Started | Depends on unresolved trigger question |

---

## Screen completion summary
| Screen | Total actionable issues | Verified | Status |
|---|---|---|---|
| 1 — Login/Signup | 2 | 0 | 🟡 Ready for verification |
| 2 — Dashboard | 4 | 0 | ⚪ Not started |
| 3 — Organization Setup | 4 | 0 | ⚪ Not started |
| 4 — Asset Registration | 2 | 0 | ⚪ Not started |
| 5 — Allocation & Transfer | 3 | 0 | ⚪ Not started |
| 6 — Resource Booking | 3 | 0 | ⚪ Not started |
| 7 — Maintenance | 1 | 0 | ⚪ Not started |
| 8 — Asset Audit | 3 | 0 | ⚪ Not started |
| 9 — Reports & Analytics | 2 | 0 | ⚪ Not started |
| 10 — Logs & Notifications | 2 | 0 | ⚪ Not started |
| Root causes | 2 | 0 | ⚪ Not started |
| Cross-cutting | 4 | 0 | ⚪ Not started |
