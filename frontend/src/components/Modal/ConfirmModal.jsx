import { useEffect } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

/**
 * Reusable confirmation modal for destructive CRUD actions.
 * Uses the shared .modal-backdrop / .modal-panel classes (DESIGN.md §Components).
 *
 * Props:
 *  - open, title, message
 *  - confirmLabel, cancelLabel
 *  - variant: 'danger' | 'primary'  (default 'danger')
 *  - busy: disables buttons + shows spinner on confirm
 *  - onConfirm, onCancel
 */
export default function ConfirmModal({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  busy = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onCancel?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  const confirmCls = variant === 'danger' ? 'btn-danger' : 'btn-primary';

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel?.();
      }}
    >
      <div className="modal-panel" role="dialog" aria-modal="true" aria-label={title}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
          {variant === 'danger' && (
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 9999,
                background: 'var(--color-semantic-error-bg)',
                color: 'var(--color-semantic-error)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
              aria-hidden="true"
            >
              <AlertTriangle size={18} />
            </div>
          )}
          <h2 className="type-card-title" style={{ color: 'var(--color-ink)', margin: 0 }}>
            {title}
          </h2>
        </div>

        {message && (
          <p className="type-body-sm" style={{ color: 'var(--color-ink-muted)', margin: '8px 0 0' }}>
            {message}
          </p>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
          <button type="button" className="btn-secondary" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={confirmCls}
            onClick={onConfirm}
            disabled={busy}
            aria-busy={busy}
          >
            {busy && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
