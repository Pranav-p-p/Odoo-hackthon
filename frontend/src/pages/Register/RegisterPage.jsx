import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Loader2, AlertCircle } from 'lucide-react';
import apiClient from '../../api/authApi';
import PasswordInput from '../../components/PasswordInput/PasswordInput';
import useAuth from '../../hooks/useAuth';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateForm({ name, email, password }) {
  const errors = {};
  if (!name.trim())           errors.name = 'Full name is required.';
  if (!email.trim())          errors.email = 'Email is required.';
  else if (!EMAIL_REGEX.test(email.trim())) errors.email = 'Enter a valid email address.';
  if (!password)              errors.password = 'Password is required.';
  else if (password.length < 8) errors.password = 'Password must be at least 8 characters.';
  return errors;
}

/**
 * RegisterPage — dark canvas design per DESIGN.md
 * Same surface grammar as LoginPage: canvas → surface-1 card.
 */
export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [fields, setFields]           = useState({ name: '', email: '', password: '' });
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
      const response = await apiClient.post('/auth/signup', {
        name: fields.name.trim(),
        email: fields.email.trim(),
        password: fields.password,
      });
      const { token, user } = response.data.data;
      login(token, user, false);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const apiMessage = err?.response?.data?.error?.message || err?.response?.data?.message || null;
      if (err?.response?.status === 400) {
        setServerError(apiMessage || 'Email already exists or invalid data.');
      } else if (!err?.response) {
        setServerError('Cannot reach the server. Please check your connection.');
      } else {
        setServerError(apiMessage || 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={{
      minHeight:       '100vh',
      backgroundColor: 'var(--color-canvas)',
      position:        'relative',
      overflow:        'hidden',
      display:         'flex',
      alignItems:      'center',
      justifyContent:  'center',
      padding:         '48px 16px',
    }}>
      {/* ── Ambient Glow & Grid ────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        background: 'radial-gradient(circle at 50% -20%, rgba(204,120,92,0.18), transparent 70%)',
      }} />
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.04,
        backgroundImage: 'linear-gradient(var(--color-ink-muted) 1px, transparent 1px), linear-gradient(90deg, var(--color-ink-muted) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        maskImage: 'radial-gradient(ellipse at 50% 30%, black 20%, transparent 70%)',
        WebkitMaskImage: 'radial-gradient(ellipse at 50% 30%, black 20%, transparent 70%)'
      }} />
      <div style={{ width: '100%', maxWidth: 380, position: 'relative', zIndex: 1 }}>

        {/* ── Brand mark ────────────────────────────────────────────────── */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 44, height: 44, borderRadius: 10, backgroundColor: 'var(--color-primary)', marginBottom: 16,
          }}>
            <svg viewBox="0 0 20 20" fill="none" width={20} height={20} aria-hidden="true">
              <rect x="3" y="3" width="6" height="6" rx="1" fill="white" fillOpacity="0.9" />
              <rect x="11" y="3" width="6" height="6" rx="1" fill="white" fillOpacity="0.6" />
              <rect x="3" y="11" width="6" height="6" rx="1" fill="white" fillOpacity="0.6" />
              <rect x="11" y="11" width="6" height="6" rx="1" fill="white" fillOpacity="0.9" />
            </svg>
          </div>
          <h1 className="type-display-md" style={{ color: 'var(--color-ink)', margin: 0 }}>Create Account</h1>
          <p className="type-body-sm" style={{ color: 'var(--color-ink-subtle)', marginTop: 6 }}>Register as an Employee</p>
        </div>

        {/* ── Form card ─────────────────────────────────────────────────── */}
        <div style={{
          backgroundColor: 'var(--color-surface-1)',
          border:          '1px solid var(--color-hairline)',
          borderRadius:    12,
          padding:         '32px 28px',
        }}>
          <form onSubmit={handleSubmit} noValidate aria-label="Registration form">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Name */}
              <div>
                <label htmlFor="name" className="field-label">Full name</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="name" name="name" type="text"
                    value={fields.name} onChange={handleChange}
                    aria-invalid={Boolean(fieldErrors.name)}
                    aria-describedby={fieldErrors.name ? 'name-error' : undefined}
                    placeholder="John Doe"
                    className={`input-field ${fieldErrors.name ? 'error' : ''}`}
                    style={{ paddingLeft: 36 }}
                  />
                  <User size={15} color='var(--color-ink-tertiary)' style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} aria-hidden="true" />
                </div>
                {fieldErrors.name && <p id="name-error" className="field-error">{fieldErrors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="field-label">Email address</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="email" name="email" type="email" autoComplete="email"
                    value={fields.email} onChange={handleChange}
                    aria-invalid={Boolean(fieldErrors.email)}
                    aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                    placeholder="you@company.com"
                    className={`input-field ${fieldErrors.email ? 'error' : ''}`}
                    style={{ paddingLeft: 36 }}
                  />
                  <Mail size={15} color='var(--color-ink-tertiary)' style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} aria-hidden="true" />
                </div>
                {fieldErrors.email && <p id="email-error" className="field-error">{fieldErrors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <PasswordInput
                  id="password" label="Password"
                  value={fields.password} onChange={handleChange}
                  error={fieldErrors.password} autoComplete="new-password"
                />
              </div>

              {/* Server error */}
              <div role="alert" aria-live="polite" aria-atomic="true">
                {serverError && (
                  <div style={{
                    display: 'flex', alignItems: 'flex-start', gap: 8,
                    backgroundColor: 'var(--color-semantic-error-bg)',
                    border: '1px solid var(--color-semantic-error)',
                    borderRadius: 8, padding: '10px 12px',
                    color: 'var(--color-semantic-error)', fontSize: 13,
                  }}>
                    <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
                    <span>{serverError}</span>
                  </div>
                )}
              </div>

              {/* Submit */}
              <button
                id="register-submit-btn"
                type="submit" disabled={isLoading}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', height: 40 }}
                aria-busy={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} aria-hidden="true" />
                    Registering…
                  </>
                ) : 'Sign up'}
              </button>
            </div>
          </form>

          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <span className="type-body-sm" style={{ color: 'var(--color-ink-subtle)' }}>
              Already have an account?{' '}
              <Link to="/login" className="text-link" style={{ fontWeight: 500 }}>Sign in</Link>
            </span>
          </div>
        </div>

        <p className="type-caption" style={{ marginTop: 24, textAlign: 'center', color: 'var(--color-ink-tertiary)' }}>
          Contact your administrator for account access.
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
