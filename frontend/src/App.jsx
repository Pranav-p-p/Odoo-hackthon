import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Login/LoginPage';
import RegisterPage from './pages/Register/RegisterPage';
// Member 2: Asset Core (Screen 4 & 5)
import AssetDirectory from './pages/Assets/AssetDirectory';
import AssetRegistrationForm from './pages/Assets/AssetRegistrationForm';
import AssetDetail from './pages/Assets/AssetDetail';
import AllocationTransferPage from './pages/AllocationTransfer/AllocationTransferPage';
import TestComponents from './pages/Assets/components/TestComponents';

/**
 * App — root router.
 *
 * Routes owned by other team members will be wired in here as they
 * build their modules. For now only /login is live.
 *
 * /dashboard is a placeholder redirect target; it will be replaced
 * by Member 4's Dashboard component.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Auth ──────────────────────────────────────────────── */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ── Asset Core (Member 2 — Screen 4) ──────────────────── */}
        {/* TODO Member 1: wrap these in <ProtectedRoute> + <DashboardLayout> once those exist */}
        <Route path="/assets"          element={<AssetDirectory />} />
        <Route path="/assets/register" element={<AssetRegistrationForm />} />
        <Route path="/assets/new"      element={<AssetRegistrationForm />} />{/* alias kept for HMR links */}
        <Route path="/assets/:id"      element={<AssetDetail />} />

        {/* ── Allocation & Transfer (Member 2 — Screen 5) ─────────── */}
        {/* TODO Member 1: wrap in <ProtectedRoute> + <DashboardLayout> */}
        <Route path="/allocation-transfer" element={<AllocationTransferPage />} />
        <Route path="/allocations"         element={<AllocationTransferPage />} />{/* alias kept */}

        {/* ── Components Test ────────────────────────────────────── */}
        <Route path="/components-test" element={<TestComponents />} />

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
