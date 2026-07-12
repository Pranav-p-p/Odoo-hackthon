import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/**
 * PasswordInput — dark canvas version per DESIGN.md
 *
 * Props:
 *   id          {string}   ties label to input
 *   label       {string}   field label (pass "" to suppress)
 *   value       {string}   controlled value
 *   onChange    {Function} change handler
 *   error       {string}   optional inline error
 *   autoComplete{string}   "current-password" | "new-password"
 */
export default function PasswordInput({
  id,
  label,
  value,
  onChange,
  error,
  autoComplete = 'current-password',
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {label && (
        <label htmlFor={id} className="field-label">{label}</label>
      )}

      <div style={{ position: 'relative' }}>
        <input
          id={id}
          name={id}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          placeholder="••••••••"
          className={`input-field ${error ? 'error' : ''}`}
          style={{ paddingRight: 38 }}
        />

        <button
          type="button"
          aria-label={visible ? 'Hide password' : 'Show password'}
          onClick={() => setVisible(v => !v)}
          style={{
            position:        'absolute',
            top:             0,
            right:           0,
            bottom:          0,
            display:         'flex',
            alignItems:      'center',
            padding:         '0 10px',
            background:      'transparent',
            border:          'none',
            cursor:          'pointer',
            color:           '#62666d',
            borderRadius:    '0 8px 8px 0',
            transition:      'color var(--duration-fast) var(--ease-standard)',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#828fff'}
          onMouseLeave={e => e.currentTarget.style.color = '#62666d'}
          tabIndex={0}
        >
          {visible ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />}
        </button>
      </div>

      {error && (
        <p id={`${id}-error`} className="field-error">{error}</p>
      )}
    </div>
  );
}
