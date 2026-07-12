import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Login/LoginPage';
import RegisterPage from './pages/Register/RegisterPage';

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
