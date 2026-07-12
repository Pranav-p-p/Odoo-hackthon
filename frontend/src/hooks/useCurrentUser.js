/**
 * useCurrentUser — thin hook for Member 2's Asset pages.
 *
 * Reads the stored user object from localStorage or sessionStorage
 * (written by LoginPage.jsx). This is intentionally minimal — Member 1
 * will provide a full AuthContext; this hook will be replaced with
 * `useContext(AuthContext)` once that lands on dev.
 *
 * Storage key: 'assetflow_user'  (set by LoginPage.jsx)
 *
 * Returns: { user: { id, name, email, role, departmentId } | null }
 */
export function useCurrentUser() {
  try {
    const raw =
      localStorage.getItem('assetflow_user') ||
      sessionStorage.getItem('assetflow_user');
    const user = raw ? JSON.parse(raw) : null;
    return { user };
  } catch {
    return { user: null };
  }
}
