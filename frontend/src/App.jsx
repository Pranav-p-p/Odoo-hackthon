import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/Login/LoginPage';
import RegisterPage from './pages/Register/RegisterPage';
import OrganizationSetupPage from './pages/OrganizationSetup/OrganizationSetupPage';

// ── Dashboard placeholder — Member 4 will replace this ─────────────────────
function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-2">Dashboard</h1>
      <p className="text-slate-500 text-sm">Dashboard module coming soon — owned by Member 4.</p>
    </div>
  );
}

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
            <Route path="/dashboard"    element={<DashboardPage />} />
            <Route path="/organization" element={<OrganizationSetupPage />} />

            {/* Placeholders — other members fill these in */}
            <Route path="/assets"        element={<Placeholder label="Assets" />} />
            <Route path="/allocations"   element={<Placeholder label="Allocations & Transfers" />} />
            <Route path="/bookings"      element={<Placeholder label="Resource Bookings" />} />
            <Route path="/maintenance"   element={<Placeholder label="Maintenance" />} />
            <Route path="/audits"        element={<Placeholder label="Audits" />} />
            <Route path="/reports"       element={<Placeholder label="Reports" />} />
            <Route path="/notifications" element={<Placeholder label="Notifications" />} />
          </Route>

          {/* ── Default redirect ────────────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

// Temporary placeholder component for routes not yet built
function Placeholder({ label }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <span className="text-2xl">🚧</span>
      </div>
      <h2 className="text-lg font-semibold text-slate-800">{label}</h2>
      <p className="text-sm text-slate-500 mt-1">This module is being built by another team member.</p>
    </div>
  );
}
