import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import apiClient from '../../api/authApi';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateForm({ email }) {
  const errors = {};
  if (!email.trim()) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.email = 'Enter a valid email address.';
  }
  return errors;
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [serverError, setServerError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(e) {
    setEmail(e.target.value);
    if (fieldError) setFieldError('');
    if (serverError) setServerError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');
    
    const errors = validateForm({ email });
    if (errors.email) {
      setFieldError(errors.email);
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post('/auth/forgot-password', { email: email.trim() });
      setIsSuccess(true);
    } catch (err) {
      const apiMessage = err?.response?.data?.error?.message || err?.response?.data?.message || null;
      if (err?.response?.status === 400) {
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
        background: 'radial-gradient(circle at 50% -20%, rgba(94, 106, 210, 0.15), transparent 70%)',
      }} />
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.04,
        backgroundImage: 'linear-gradient(#c9d1d9 1px, transparent 1px), linear-gradient(90deg, #c9d1d9 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        maskImage: 'radial-gradient(ellipse at 50% 30%, black 20%, transparent 70%)',
        WebkitMaskImage: 'radial-gradient(ellipse at 50% 30%, black 20%, transparent 70%)'
      }} />
      <div style={{ width: '100%', maxWidth: 380, position: 'relative', zIndex: 1 }}>

        {/* ── Brand mark + heading ─────────────────────────────────────────── */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display:         'inline-flex',
            alignItems:      'center',
            justifyContent:  'center',
            width:           44,
            height:          44,
            borderRadius:    10,
            backgroundColor: 'var(--color-primary)',
            marginBottom:    16,
          }}>
            <svg viewBox="0 0 20 20" fill="none" width={20} height={20} aria-hidden="true">
              <rect x="3" y="3" width="6" height="6" rx="1" fill="white" fillOpacity="0.9" />
              <rect x="11" y="3" width="6" height="6" rx="1" fill="white" fillOpacity="0.6" />
              <rect x="3" y="11" width="6" height="6" rx="1" fill="white" fillOpacity="0.6" />
              <rect x="11" y="11" width="6" height="6" rx="1" fill="white" fillOpacity="0.9" />
            </svg>
          </div>
          <h1 className="type-display-md" style={{ color: 'var(--color-ink)', margin: 0 }}>
            Reset Password
          </h1>
          <p className="type-body-sm" style={{ color: 'var(--color-ink-subtle)', marginTop: 6 }}>
            Enter your email to receive a reset link
          </p>
        </div>

        {/* ── Form card ─────────────────────────────────────────────────── */}
        <div style={{
          backgroundColor: 'var(--color-surface-1)',
          border:          '1px solid #23252a',
          borderRadius:    12,
          padding:         '32px 28px',
        }}>
          {isSuccess ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', marginBottom: 16 }}>
                <CheckCircle size={48} color="var(--color-semantic-success)" />
              </div>
              <h2 className="type-body-lg" style={{ color: 'var(--color-ink)', marginBottom: 8 }}>
                Check your email
              </h2>
              <p className="type-body-sm" style={{ color: 'var(--color-ink-subtle)', marginBottom: 24 }}>
                If an account exists with that email, we have sent a password reset link.
              </p>
              <Link to="/login" className="btn-primary" style={{ display: 'flex', width: '100%', justifyContent: 'center', height: 40, textDecoration: 'none' }}>
                Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate aria-label="Forgot password form">
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
                      value={email}
                      onChange={handleChange}
                      aria-invalid={Boolean(fieldError)}
                      aria-describedby={fieldError ? 'email-error' : undefined}
                      placeholder="you@company.com"
                      className={`input-field ${fieldError ? 'error' : ''}`}
                      style={{ paddingLeft: 36 }}
                    />
                    <Mail
                      size={15}
                      color='var(--color-ink-tertiary)'
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
                  {fieldError && (
                    <p id="email-error" className="field-error">{fieldError}</p>
                  )}
                </div>

                {/* ── Server error ─────────────────────────────────────── */}
                <div role="alert" aria-live="polite" aria-atomic="true">
                  {serverError && (
                    <div style={{
                      display:         'flex',
                      alignItems:      'flex-start',
                      gap:             8,
                      backgroundColor: 'var(--color-semantic-error-bg)',
                      border:          '1px solid rgba(248,81,73,0.30)',
                      borderRadius:    8,
                      padding:         '10px 12px',
                      color:           'var(--color-semantic-error)',
                      fontSize:        13,
                    }}>
                      <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
                      <span>{serverError}</span>
                    </div>
                  )}
                </div>

                {/* ── Submit ─────────────────────────────────────────────────── */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', height: 40 }}
                  aria-busy={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} aria-hidden="true" />
                      Sending…
                    </>
                  ) : (
                    'Send reset link'
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ── Back to login link ─────────────────────────────────────────── */}
          {!isSuccess && (
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <Link to="/login" className="text-link" style={{ fontSize: 13, fontWeight: 500 }}>
                Back to login
              </Link>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
