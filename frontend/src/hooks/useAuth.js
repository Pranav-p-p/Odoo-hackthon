import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * useAuth()
 * Convenience hook to access AuthContext values.
 *
 * Returns:
 *   { currentUser, loading, login, logout, isAuthenticated }
 *
 * Usage:
 *   const { currentUser, logout } = useAuth();
 */
export default function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an <AuthProvider>.');
  }

  return context;
}
