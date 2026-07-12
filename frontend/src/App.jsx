import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// ── Member 1: Identity & Foundation ─────────────────────────────────────────
import LoginPage from './pages/Login/LoginPage';
import RegisterPage from './pages/Register/RegisterPage';
import OrganizationSetupPage from './pages/OrganizationSetup/OrganizationSetupPage';

// Member 2: Asset Core (Screen 4 & 5)
import AssetDirectory from './pages/Assets/AssetDirectory';
import AssetRegistrationForm from './pages/Assets/AssetRegistrationForm';
import AssetDetail from './pages/Assets/AssetDetail';
import AllocationTransferPage from './pages/AllocationTransfer/AllocationTransferPage';
import TestComponents from './pages/Assets/components/TestComponents';

// Dashboard placeholder - Member 4 will replace this
function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-2">Dashboard</h1>
      <p className="text-slate-500 text-sm">Dashboard module coming soon - owned by Member 4.</p>
    </div>
  );
}

// Temporary placeholder component for routes not yet built
// ── Member 3: Operations Module (Screen 6 & 7) ───────────────────────────────
import ResourceBookingPage from './pages/ResourceBooking/ResourceBookingPage';
import MaintenancePage from './pages/Maintenance/MaintenancePage';

// ── Member 4: Intelligence Module (Screen 2, 8, 9, 10) ──────────────────────
import DashboardPage from './pages/Dashboard/DashboardPage';
import AuditPage from './pages/Audit/AuditPage';
import ReportsPage from './pages/Reports/ReportsPage';
import NotificationsPage from './pages/Notifications/NotificationsPage';

/**
 * App — root router.
 *
 * Current live routes:
 *   /login              — Member 1 (LoginPage)
 *   /register           — Member 1 (RegisterPage)
 *   /dashboard          — Member 4 (DashboardPage)
 *   /organization       — Member 1 (OrganizationSetupPage)
 *   /bookings           — Member 3 (ResourceBookingPage)   ← Screen 6
 *   /maintenance        — Member 3 (MaintenancePage)       ← Screen 7
 *   /audits             — Member 4 (AuditPage)             ← Screen 8
 *   /reports            — Member 4 (ReportsPage)           ← Screen 9
 *   /notifications      — Member 4 (NotificationsPage)     ← Screen 10
 *
 * TODO [MEMBER 2]: Add /assets and /allocations routes when Asset Core pages are delivered
 */
export default function App() {
  return (
    <BrowserRouter>
      {/* AuthProvider wraps the entire tree so all components can access auth state */}
      <AuthProvider>
        <Routes>
          {/* ── Public routes ──────────────────────────────────────────── */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ── Protected routes (require authentication) ──────────────── */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Member 4 — Screen 2: Dashboard */}
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Member 1 — Screen 3: Organization Setup */}
            <Route path="/organization" element={<OrganizationSetupPage />} />

            {/* Member 2 — Screen 4 & 5: Assets & Allocations (placeholders until delivered) */}
            <Route path="/assets" element={<Placeholder label="Assets" />} />
            <Route path="/allocations" element={<Placeholder label="Allocations & Transfers" />} />

            {/* Member 3 — Screen 6: Resource Booking */}
            <Route path="/bookings" element={<ResourceBookingPage />} />

            {/* Member 3 — Screen 7: Maintenance Management */}
            <Route path="/maintenance" element={<MaintenancePage />} />

            {/* Member 4 — Screen 8: Asset Audit */}
            <Route path="/audits" element={<AuditPage />} />

            {/* Member 4 — Screen 9: Reports & Analytics */}
            <Route path="/reports" element={<ReportsPage />} />

            {/* Member 4 — Screen 10: Notifications & Activity Logs */}
            <Route path="/notifications" element={<NotificationsPage />} />
          </Route>

          {/* ── Default redirect ────────────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

// ── Temporary placeholder for routes not yet built ───────────────────────────
function Placeholder({ label }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <span className="text-2xl">🚧</span>
      </div>
      <h2 className="text-lg font-semibold text-slate-800">{label}</h2>
      <p className="text-sm text-slate-500 mt-1">
        This module is being built by another team member.
      </p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      {/* AuthProvider wraps the entire tree so all components can access auth state */}
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Asset Core (Member 2 - Screen 4) - unprotected for now */}
          {/* TODO Member 1: wrap these in <ProtectedRoute> + <DashboardLayout> once auth is stable */}
          <Route path="/assets" element={<AssetDirectory />} />
          <Route path="/assets/register" element={<AssetRegistrationForm />} />
          <Route path="/assets/new" element={<AssetRegistrationForm />} />
          <Route path="/assets/:id" element={<AssetDetail />} />

          {/* Allocation & Transfer (Member 2 - Screen 5) */}
          {/* TODO Member 1: wrap in <ProtectedRoute> + <DashboardLayout> */}
          <Route path="/allocation-transfer" element={<AllocationTransferPage />} />
          <Route path="/allocations" element={<AllocationTransferPage />} />

          {/* Components Test */}
          <Route path="/components-test" element={<TestComponents />} />

          {/* Protected routes (require authentication) */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/organization" element={<OrganizationSetupPage />} />

            {/* Placeholders - other members fill these in */}
            <Route path="/bookings" element={<Placeholder label="Resource Bookings" />} />
            <Route path="/maintenance" element={<Placeholder label="Maintenance" />} />
            <Route path="/audits" element={<Placeholder label="Audits" />} />
            <Route path="/reports" element={<Placeholder label="Reports" />} />
            <Route path="/notifications" element={<Placeholder label="Notifications" />} />
          </Route>

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

