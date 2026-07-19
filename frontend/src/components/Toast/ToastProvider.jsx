import { createContext, useContext, useState, useRef, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};
const ACCENT = {
  success: 'var(--color-status-available)',
  error: 'var(--color-semantic-error)',
  info: 'var(--color-status-allocated)',
  warning: 'var(--color-status-maintenance)',
};

/**
 * Global toast system. Mount once near the app root; call useToast() anywhere.
 * - toast.success/error/info/warning(message, { title, duration })
 * - auto-dismiss after duration (ms); duration: 0 keeps it until dismissed.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((type, message, opts = {}) => {
    const id = ++idRef.current;
    const duration = opts.duration ?? 4000;
    setToasts((list) => [...list, { id, type, message, title: opts.title }]);
    if (duration > 0) setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  const api = {
    dismiss,
    toast: push,
    success: (m, o) => push('success', m, o),
    error: (m, o) => push('error', m, o),
    info: (m, o) => push('info', m, o),
    warning: (m, o) => push('warning', m, o),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-viewport" role="region" aria-live="polite" aria-label="Notifications">
        {toasts.map((t) => {
          const Icon = ICONS[t.type] ?? Info;
          const accent = ACCENT[t.type] ?? ACCENT.info;
          return (
            <div key={t.id} className="toast" style={{ borderLeft: `3px solid ${accent}` }}>
              <Icon size={16} style={{ color: accent, flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                {t.title && (
                  <span className="type-body-sm" style={{ fontWeight: 600, color: 'var(--color-ink)' }}>
                    {t.title}
                  </span>
                )}
                <span className="type-body-sm" style={{ color: 'var(--color-ink-muted)' }}>{t.message}</span>
              </div>
              <button
                type="button"
                className="btn-icon-row"
                style={{ marginLeft: 'auto', width: 28, height: 28, flexShrink: 0 }}
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
