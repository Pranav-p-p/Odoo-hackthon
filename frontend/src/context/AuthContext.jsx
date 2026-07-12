import { createContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../api/authApi';

/**
 * AuthContext
 * Provides currentUser, login(), logout(), and loading state
 * to the entire application via React Context.
 */
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while checking stored token

  /**
   * On mount, check if a token exists in localStorage or sessionStorage.
   * If it does, fetch the user profile from GET /auth/me.
   */
  useEffect(() => {
    async function loadUser() {
      const token =
        localStorage.getItem('assetflow_token') ||
        sessionStorage.getItem('assetflow_token');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await apiClient.get('/auth/me');
        setCurrentUser(res.data.data);
      } catch {
        // Token is invalid or expired — clear it
        localStorage.removeItem('assetflow_token');
        localStorage.removeItem('assetflow_user');
        sessionStorage.removeItem('assetflow_token');
        sessionStorage.removeItem('assetflow_user');
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  /**
   * login(token, user, remember)
   * Called after a successful POST /auth/login.
   * Stores the JWT and sets the current user in state.
   */
  const login = useCallback((token, user, remember = false) => {
    if (remember) {
      localStorage.setItem('assetflow_token', token);
      localStorage.setItem('assetflow_user', JSON.stringify(user));
    } else {
      sessionStorage.setItem('assetflow_token', token);
      sessionStorage.setItem('assetflow_user', JSON.stringify(user));
    }
    setCurrentUser(user);
  }, []);

  /**
   * logout()
   * Clears token from both stores and resets current user.
   */
  const logout = useCallback(() => {
    localStorage.removeItem('assetflow_token');
    localStorage.removeItem('assetflow_user');
    sessionStorage.removeItem('assetflow_token');
    sessionStorage.removeItem('assetflow_user');
    setCurrentUser(null);
  }, []);

  const value = {
    currentUser,
    loading,
    login,
    logout,
    isAuthenticated: !!currentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
