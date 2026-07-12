import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Login/LoginPage';
import RegisterPage from './pages/Register/RegisterPage';
// Member 3 — Operations Module (Screen 6 & 7)
import ResourceBookingPage from './pages/ResourceBooking/ResourceBookingPage';
import MaintenancePage from './pages/Maintenance/MaintenancePage';

// TODO [MEMBER 1]: Import DashboardLayout when delivered
// import DashboardLayout from './layouts/DashboardLayout';

// TODO [MEMBER 4]: Import DashboardPage when delivered
// import DashboardPage from './pages/Dashboard/DashboardPage';

/**
 * App — root router.
 *
 * Routes owned by other team members will be wired in here as they
 * build their modules.
 *
 * Current live routes:
 *   /login         — Member 1 (LoginPage)
 *   /register      — Member 1 (RegisterPage)
 *   /booking       — Member 3 (ResourceBookingPage) ← Phase 8
 *   /maintenance   — Member 3 (MaintenancePage)     ← Phase 8
 *   /dashboard     — Placeholder (Member 4 will own this)
 *
 * TODO [MEMBER 1]: Wrap /booking and /maintenance in <DashboardLayout>
 *   once DashboardLayout.jsx is delivered (adds sidebar navigation)
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Auth ──────────────────────────────────────────────── */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ── Member 3: Operations Module ───────────────────────── */}
        {/* Screen 6 — Resource Booking */}
        {/* TODO [MEMBER 1]: Wrap element in <DashboardLayout> when delivered */}
        <Route path="/booking" element={<ResourceBookingPage />} />

        {/* Screen 7 — Maintenance Kanban */}
        {/* TODO [MEMBER 1]: Wrap element in <DashboardLayout> when delivered */}
        <Route path="/maintenance" element={<MaintenancePage />} />

        {/* ── Dashboard placeholder — Member 4 will own this ───── */}
        <Route
          path="/dashboard"
          element={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-semibold text-slate-800 mb-2">
                  Dashboard
                </h1>
                <p className="text-slate-500 text-sm">
                  Dashboard module coming soon — owned by Member 4.
                </p>
              </div>
            </div>
          }
        />

        {/* ── Default: redirect to login ─────────────────────────── */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
