import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// ── Member 1: Identity & Foundation ─────────────────────────────────────────
import LoginPage from './pages/Login/LoginPage';
import RegisterPage from './pages/Register/RegisterPage';
import OrganizationSetupPage from './pages/OrganizationSetup/OrganizationSetupPage';

// ── Member 2: Asset Core (Screen 4 & 5) ─────────────────────────────────────
import AssetDirectory from './pages/Assets/AssetDirectory';
import AssetRegistrationForm from './pages/Assets/AssetRegistrationForm';
import AssetDetail from './pages/Assets/AssetDetail';
import AllocationTransferPage from './pages/AllocationTransfer/AllocationTransferPage';
import TestComponents from './pages/Assets/components/TestComponents';

// ── Member 3: Operations Module (Screen 6 & 7) ───────────────────────────────
import ResourceBookingPage from './pages/ResourceBooking/ResourceBookingPage';
import MaintenancePage from './pages/Maintenance/MaintenancePage';

// ── Member 4: Intelligence Module (Screen 2, 8, 9, 10) ──────────────────────
import DashboardPage from './pages/Dashboard/DashboardPage';
import AuditPage from './pages/Audit/AuditPage';
import ReportsPage from './pages/Reports/ReportsPage';
import NotificationsPage from './pages/Notifications/NotificationsPage';

export default function App() {
  return (
    <BrowserRouter>
      {/* AuthProvider wraps the entire tree so all components can access auth state */}
      <AuthProvider>
        <Routes>
          {/* ── Public routes ──────────────────────────────────────────── */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />



          {/* Components Test */}
          <Route path="/components-test" element={<TestComponents />} />

          {/* ── Protected routes (require authentication) ──────────────── */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Member 2 — Screen 4: Asset Core */}
            <Route path="/assets" element={<AssetDirectory />} />
            <Route path="/assets/register" element={<AssetRegistrationForm />} />
            <Route path="/assets/new" element={<AssetRegistrationForm />} />
            <Route path="/assets/:id" element={<AssetDetail />} />

            {/* Member 2 — Screen 5: Allocation & Transfer */}
            <Route path="/allocation-transfer" element={<AllocationTransferPage />} />
            <Route path="/allocations" element={<AllocationTransferPage />} />

            {/* Member 4 — Screen 2: Dashboard */}
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Member 1 — Screen 3: Organization Setup */}
            <Route path="/organization" element={<OrganizationSetupPage />} />

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

