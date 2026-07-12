/**
 * RoleGate — conditionally renders children based on the current user's role.
 * 
 * Exact role strings (SHARED_ENUMS.md):
 * ADMIN, ASSET_MANAGER, DEPARTMENT_HEAD, EMPLOYEE
 */

function getCurrentUser() {
  try {
    const raw = localStorage.getItem('assetflow_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function RoleGate({ allow = [], children }) {
  const user = getCurrentUser();
  
  if (!user || !user.role) return null;
  if (!allow.includes(user.role)) return null;

  return children;
}
