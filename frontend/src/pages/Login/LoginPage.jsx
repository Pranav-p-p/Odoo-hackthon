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

// ─── Role → route map ─────────────────────────────────────────────────────────

const ROLE_REDIRECT = {
  ADMIN:          '/dashboard',
  ASSET_MANAGER:  '/dashboard',
  DEPARTMENT_HEAD:'/dashboard',
  EMPLOYEE:       '/dashboard',
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * LoginPage — dark canvas design per DESIGN.md
 * - Canvas (#010102) background
 * - Surface-1 form card with hairline border (no shadow)
 * - Lavender (#5e6ad2) primary CTA — btn-primary class
 * - Inter font, negative letter-spacing on headings
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [fields, setFields]           = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe]   = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading]     = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setFields(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));
    if (serverError) setServerError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');
    const errors = validateForm(fields);
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }

    setIsLoading(true);
    try {
      const result = await loginUser(fields.email.trim(), fields.password);
      const { token, user } = result.data;
      login(token, user, rememberMe);
      const destination = ROLE_REDIRECT[user.role] ?? '/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
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

  return (
    /* ── Full-page dark canvas ─────────────────────────────────────────────── */
    <div style={{
      minHeight:       '100vh',
      backgroundColor: '#010102',       /* canvas */
      display:         'flex',
      alignItems:      'center',
      justifyContent:  'center',
      padding:         '48px 16px',
    }}>
      <div style={{ width: '100%', maxWidth: 380 }}>

        {/* ── Brand mark + heading ─────────────────────────────────────────── */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          {/* Lavender glyph */}
          <div style={{
            display:         'inline-flex',
            alignItems:      'center',
            justifyContent:  'center',
            width:           44,
            height:          44,
            borderRadius:    10,
            backgroundColor: '#5e6ad2',
            marginBottom:    16,
          }}>
            <svg viewBox="0 0 20 20" fill="none" width={20} height={20} aria-hidden="true">
              <rect x="3" y="3" width="6" height="6" rx="1" fill="white" fillOpacity="0.9" />
              <rect x="11" y="3" width="6" height="6" rx="1" fill="white" fillOpacity="0.6" />
              <rect x="3" y="11" width="6" height="6" rx="1" fill="white" fillOpacity="0.6" />
              <rect x="11" y="11" width="6" height="6" rx="1" fill="white" fillOpacity="0.9" />
            </svg>
          </div>

          <h1 className="type-display-md" style={{ color: '#f7f8f8', margin: 0 }}>
            AssetFlow
          </h1>
          <p className="type-body-sm" style={{ color: '#8a8f98', marginTop: 6 }}>
            Sign in to your workspace
          </p>
        </div>

        {/* ── Form card — surface-1 lift, hairline border ──────────────────── */}
        <div style={{
          backgroundColor: '#0f1011',    /* surface-1 */
          border:          '1px solid #23252a',
          borderRadius:    12,
          padding:         '32px 28px',
        }}>
          <form id="login-form" onSubmit={handleSubmit} noValidate aria-label="Sign in form">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* ── Email ──────────────────────────────────────────────────── */}
              <div>
                <label htmlFor="email" className="field-label">
                  Email address
                </label>
                <div style={{ position: 'relative' }}>
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
                    className={`input-field ${fieldErrors.email ? 'error' : ''}`}
                    style={{ paddingLeft: 36 }}
                  />
                  <Mail
                    size={15}
                    color="#62666d"
                    style={{
                      position:      'absolute',
                      left:          11,
                      top:           '50%',
                      transform:     'translateY(-50%)',
                      pointerEvents: 'none',
                    }}
                    aria-hidden="true"
                  />
                </div>
                {fieldErrors.email && (
                  <p id="email-error" className="field-error">{fieldErrors.email}</p>
                )}
              </div>

              {/* ── Password ───────────────────────────────────────────────── */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label htmlFor="password" className="field-label" style={{ margin: 0 }}>
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    id="forgot-password-link"
                    className="text-link"
                    style={{ fontSize: 12 }}
                  >
                    Forgot password?
                  </Link>
                </div>
                <PasswordInput
                  id="password"
                  label=""
                  value={fields.password}
                  onChange={handleChange}
                  error={fieldErrors.password}
                />
              </div>

              {/* ── Remember me ────────────────────────────────────────────── */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  id="remember-me"
                  name="rememberMe"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  style={{
                    width:       16,
                    height:      16,
                    accentColor: '#5e6ad2',
                    cursor:      'pointer',
                  }}
                />
                <label
                  htmlFor="remember-me"
                  className="type-body-sm"
                  style={{ color: '#8a8f98', cursor: 'pointer', userSelect: 'none' }}
                >
                  Remember me
                </label>
              </div>

              {/* ── Server / API error ─────────────────────────────────────── */}
              <div role="alert" aria-live="polite" aria-atomic="true" id="login-error-region">
                {serverError && (
                  <div style={{
                    display:         'flex',
                    alignItems:      'flex-start',
                    gap:             8,
                    backgroundColor: 'rgba(248,81,73,0.10)',
                    border:          '1px solid rgba(248,81,73,0.30)',
                    borderRadius:    8,
                    padding:         '10px 12px',
                    color:           '#f85149',
                    fontSize:        13,
                  }}>
                    <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
                    <span>{serverError}</span>
                  </div>
                )}
              </div>

              {/* ── Submit ─────────────────────────────────────────────────── */}
              <button
                id="login-submit-btn"
                type="submit"
                disabled={isLoading}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', height: 40 }}
                aria-busy={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} aria-hidden="true" />
                    Signing in…
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

          {/* ── Sign up link ─────────────────────────────────────────────────── */}
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <span className="type-body-sm" style={{ color: '#8a8f98' }}>
              Don't have an account?{' '}
              <Link to="/register" className="text-link" style={{ fontWeight: 500 }}>
                Sign up
              </Link>
            </span>
          </div>
        </div>

        {/* ── Footer microcopy ──────────────────────────────────────────────── */}
        <p className="type-caption" style={{ marginTop: 24, textAlign: 'center', color: '#62666d' }}>
          Contact your administrator for account access.
        </p>
      </div>

      {/* Spinner keyframe */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
