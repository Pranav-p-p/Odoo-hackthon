import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

/**
 * ProtectedRoute
 * Wraps any child components and redirects unauthenticated users to /login.
 * Shows a loading spinner while the auth state is being resolved on first load.
 *
 * Usage in App.jsx:
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/dashboard" element={<Dashboard />} />
 *   </Route>
 *
 * Or wrap individual routes:
 *   <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Still loading — show a minimal spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading…</p>
        </div>
      </div>
    );
  }

  // Not authenticated — redirect to login, preserving the intended destination
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
