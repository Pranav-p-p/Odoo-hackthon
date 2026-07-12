import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Loader2, AlertCircle } from 'lucide-react';
import { loginUser } from '../../api/authApi';
import PasswordInput from '../../components/PasswordInput/PasswordInput';
import useAuth from '../../hooks/useAuth';

// ─── Validation helpers ───────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateForm({ email, password }) {
  const errors = {};
  if (!email.trim()) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.email = 'Enter a valid email address.';
  }
  if (!password) {
    errors.password = 'Password is required.';
  }
  return errors;
}

// ─── Role → route map (all redirect to /dashboard; other modules extend this) ─

const ROLE_REDIRECT = {
  ADMIN: '/dashboard',
  ASSET_MANAGER: '/dashboard',
  DEPARTMENT_HEAD: '/dashboard',
  EMPLOYEE: '/dashboard',
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * LoginPage
 *
 * Minimal, professional login form for AssetFlow.
 * - Controlled inputs
 * - Client-side validation (required + email format)
 * - Calls POST /api/v1/auth/login via axios
 * - Loading state on submit button
 * - Inline error message (aria-live) on failure
 * - Stores JWT; redirects by returned role
 * - Fully accessible: label/input association, visible focus states
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // ── Form state ──────────────────────────────────────────────────────────────
  const [fields, setFields] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ── Handlers ────────────────────────────────────────────────────────────────

  function handleChange(e) {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    // Clear field-level error on edit
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    // Clear server error on any change
    if (serverError) setServerError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');

    // Client-side validation
    const errors = validateForm(fields);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      const result = await loginUser(fields.email.trim(), fields.password);

      // API_CONTRACT.md: { success: true, data: { token, user } }
      const { token, user } = result.data;

      // Store token + update AuthContext state
      login(token, user, rememberMe);

      // Redirect by role
      const destination = ROLE_REDIRECT[user.role] ?? '/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      // Extract human-readable message from error response
      const apiMessage =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        null;

      if (err?.response?.status === 401) {
        setServerError(apiMessage || 'Invalid email or password. Please try again.');
      } else if (err?.response?.status === 400) {
        setServerError(apiMessage || 'Please check your input and try again.');
      } else if (!err?.response) {
        setServerError('Cannot reach the server. Please check your connection.');
      } else {
        setServerError(apiMessage || 'Something went wrong. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      {/* ── Card ─────────────────────────────────────────────────────────── */}
      <div className="w-full max-w-sm">

        {/* Logo / Brand */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-600 mb-4">
            {/* Simple geometric mark — no external image needed */}
            <svg
              viewBox="0 0 20 20"
              fill="none"
              className="w-5 h-5 text-white"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="6" height="6" rx="1" fill="white" fillOpacity="0.9" />
              <rect x="11" y="3" width="6" height="6" rx="1" fill="white" fillOpacity="0.6" />
              <rect x="3" y="11" width="6" height="6" rx="1" fill="white" fillOpacity="0.6" />
              <rect x="11" y="11" width="6" height="6" rx="1" fill="white" fillOpacity="0.9" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            AssetFlow
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Sign in to your workspace
          </p>
        </div>

        {/* ── Form card ────────────────────────────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm px-8 py-8">
          <form
            id="login-form"
            onSubmit={handleSubmit}
            noValidate
            aria-label="Sign in form"
          >
            <div className="space-y-5">

              {/* ── Email ──────────────────────────────────────────────────── */}
              <div className="space-y-1">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700"
                >
                  Email address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    autoFocus
                    value={fields.email}
                    onChange={handleChange}
                    aria-invalid={Boolean(fieldErrors.email)}
                    aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                    placeholder="you@company.com"
                    className={[
                      'block w-full rounded-md border px-3 py-2 text-sm text-slate-900 placeholder-slate-400',
                      'pl-9 outline-none',
                      'focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
                      'transition-colors duration-150',
                      fieldErrors.email
                        ? 'border-red-400 bg-red-50'
                        : 'border-slate-300 bg-white hover:border-slate-400',
                    ].join(' ')}
                  />
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none"
                    aria-hidden="true"
                  />
                </div>
                {fieldErrors.email && (
                  <p id="email-error" className="text-xs text-red-600 mt-0.5">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              {/* ── Password ───────────────────────────────────────────────── */}
              <div className="space-y-1">
                {/* Label row: "Password" left, "Forgot password?" right */}
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    id="forgot-password-link"
                    className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* PasswordInput handles the input + toggle internally */}
                <PasswordInput
                  id="password"
                  label=""
                  value={fields.password}
                  onChange={handleChange}
                  error={fieldErrors.password}
                />
              </div>

              {/* ── Remember me ────────────────────────────────────────────── */}
              <div className="flex items-center gap-2">
                <input
                  id="remember-me"
                  name="rememberMe"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label
                  htmlFor="remember-me"
                  className="text-sm text-slate-600 cursor-pointer select-none"
                >
                  Remember me
                </label>
              </div>

              {/* ── Server / API error (inline, aria-live) ─────────────────── */}
              {/* Always rendered so screen readers observe the live region */}
              <div
                role="alert"
                aria-live="polite"
                aria-atomic="true"
                id="login-error-region"
              >
                {serverError && (
                  <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                    <AlertCircle
                      className="h-4 w-4 mt-0.5 flex-shrink-0"
                      aria-hidden="true"
                    />
                    <span>{serverError}</span>
                  </div>
                )}
              </div>

              {/* ── Submit ─────────────────────────────────────────────────── */}
              <button
                id="login-submit-btn"
                type="submit"
                disabled={isLoading}
                className={[
                  'w-full flex items-center justify-center gap-2',
                  'rounded-md px-4 py-2.5 text-sm font-medium text-white',
                  'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
                  'transition-colors duration-150',
                  'disabled:opacity-60 disabled:cursor-not-allowed',
                ].join(' ')}
                aria-busy={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Signing in…
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

          {/* Redirect link to Register */}
          <div className="mt-6 text-center text-sm text-slate-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-800 hover:underline">
              Sign up
            </Link>
          </div>
        </div>

        {/* ── Footer microcopy ───────────────────────────────────────────────── */}
        <p className="mt-6 text-center text-xs text-slate-500">
          Contact your administrator for account access.
        </p>
      </div>
    </div>
  );
}
