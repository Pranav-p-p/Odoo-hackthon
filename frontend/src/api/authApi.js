import axios from 'axios';

/**
 * Axios instance pre-configured for the AssetFlow backend.
 * Base URL: /api/v1 — proxied by Vite dev server to avoid CORS issues.
 */
const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Attach the stored JWT to every outgoing request automatically.
 */
apiClient.interceptors.request.use((config) => {
  // Check localStorage first ("Remember me"), then sessionStorage (session-only)
  const token =
    localStorage.getItem('assetflow_token') ||
    sessionStorage.getItem('assetflow_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * POST /auth/login
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ token: string, user: { id: string, name: string, email: string, role: string } }>}
 *
 * Success shape (per API_CONTRACT.md):
 *   { success: true, data: { token, user } }
 *
 * Error shape:
 *   { success: false, error: { code, message } }
 */
export async function loginUser(email, password) {
  const response = await apiClient.post('/auth/login', { email, password });
  // The backend wraps everything in { success, data }
  return response.data;
}

export default apiClient;
