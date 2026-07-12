import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/**
 * PasswordInput — reusable password field with visibility toggle.
 *
 * Props:
 *   id        {string}   - ties <label> to <input> for accessibility
 *   label     {string}   - field label text
 *   value     {string}   - controlled input value
 *   onChange  {Function} - change handler
 *   error     {string}   - optional inline error message
 *   autoComplete {string} - "current-password" | "new-password"
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
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          name={id}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={[
            'block w-full rounded-md border px-3 py-2 text-sm text-slate-900 placeholder-slate-400',
            'pr-10 outline-none',
            'focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
            'transition-colors duration-150',
            error
              ? 'border-red-400 bg-red-50'
              : 'border-slate-300 bg-white hover:border-slate-400',
          ].join(' ')}
          placeholder="••••••••"
        />

        <button
          type="button"
          aria-label={visible ? 'Hide password' : 'Show password'}
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-r-md transition-colors"
          tabIndex={0}
        >
          {visible ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>

      {error && (
        <p id={`${id}-error`} className="text-xs text-red-600 mt-0.5">
          {error}
        </p>
      )}
    </div>
  );
}
