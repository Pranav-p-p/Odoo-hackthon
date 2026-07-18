/**
 * RoleGate — conditionally renders children based on the current user's role.
 * 
 * Exact role strings (SHARED_ENUMS.md):
 * ADMIN, ASSET_MANAGER, DEPARTMENT_HEAD, EMPLOYEE
 */
import useAuth from '../../hooks/useAuth';

export default function RoleGate({ allow = [], children }) {
  const { currentUser: user } = useAuth();
  
  if (!user || !user.role) return null;
  if (!allow.includes(user.role)) return null;

  return children;
}
