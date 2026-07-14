/**
 * StatusBadge — DESIGN.md dark canvas version
 *
 * Shape grammar: pill (9999px radius) = state token. NEVER rounded-rect.
 * Color grammar: semantic spectrum at ~14% alpha fill + full-strength text.
 *   - AVAILABLE / RETURNED / RESOLVED / APPROVED (terminal) → success (green)
 *   - ALLOCATED / ACTIVE / APPROVED (workflow)              → info (blue)
 *   - RESERVED / TECHNICIAN_ASSIGNED                        → lavender (brand)
 *   - UNDER_MAINTENANCE / PENDING_APPROVAL / REQUESTED      → warning (amber)
 *   - LOST / REJECTED / OVERDUE                             → error (red)
 *   - RETIRED / DISPOSED / COMPLETED                        → neutral (slate)
 *
 * Handles: asset | allocation | transfer | maintenance status enums.
 */

/* ── Inline styles per status — avoids light-mode Tailwind color classes ── */
const STYLES = {
  /* Asset lifecycle */
  AVAILABLE:           { background: 'var(--color-status-available-bg)',   color: 'var(--color-status-available)' },
  ALLOCATED:           { background: 'var(--color-status-allocated-bg)',  color: 'var(--color-status-allocated)' },
  RESERVED:            { background: 'var(--color-badge-brand-bg)',  color: 'var(--color-primary-hover)' },
  UNDER_MAINTENANCE:   { background: 'var(--color-status-maintenance-bg)',  color: 'var(--color-status-maintenance)' },
  LOST:                { background: 'rgba(248,81,73,0.14)',   color: 'var(--color-semantic-error)' },
  RETIRED:             { background: 'var(--color-status-disposed-bg)', color: 'var(--color-status-disposed)' },
  DISPOSED:            { background: 'var(--color-status-disposed-bg)', color: 'var(--color-status-disposed)' },

  /* Allocation statuses */
  ACTIVE:              { background: 'var(--color-status-allocated-bg)',  color: 'var(--color-status-allocated)' },
  RETURNED:            { background: 'var(--color-status-available-bg)',   color: 'var(--color-status-available)' },
  OVERDUE:             { background: 'rgba(248,81,73,0.14)',   color: 'var(--color-semantic-error)' },

  /* Transfer statuses */
  REQUESTED:           { background: 'var(--color-status-maintenance-bg)',  color: 'var(--color-status-maintenance)' },
  APPROVED:            { background: 'var(--color-status-available-bg)',   color: 'var(--color-status-available)' },
  REJECTED:            { background: 'rgba(248,81,73,0.14)',   color: 'var(--color-semantic-error)' },
  COMPLETED:           { background: 'var(--color-status-disposed-bg)', color: 'var(--color-status-disposed)' },

  /* Maintenance statuses */
  PENDING_APPROVAL:    { background: 'var(--color-status-maintenance-bg)',  color: 'var(--color-status-maintenance)' },
  TECHNICIAN_ASSIGNED: { background: 'var(--color-badge-brand-bg)',  color: 'var(--color-primary-hover)' },
  IN_PROGRESS:         { background: 'var(--color-status-allocated-bg)',  color: 'var(--color-status-allocated)' },
  RESOLVED:            { background: 'var(--color-status-available-bg)',   color: 'var(--color-status-available)' },
};

const FALLBACK = { background: 'var(--color-status-disposed-bg)', color: 'var(--color-status-disposed)' };

/* Formats "UNDER_MAINTENANCE" → "Under Maintenance" */
function formatLabel(status) {
  if (!status) return '—';
  return status
    .split('_')
    .map(w => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ');
}

/**
 * @param {Object} props
 * @param {'asset'|'allocation'|'transfer'|'maintenance'} [props.type]  — unused but kept for API compat
 * @param {string} props.status — The raw enum value
 */
export default function StatusBadge({ status }) {
  const style = STYLES[status] ?? FALLBACK;

  return (
    <span
      style={{
        display:         'inline-flex',
        alignItems:      'center',
        borderRadius:    9999,       /* pill — state grammar */
        padding:         '3px 10px',
        fontSize:        11,
        fontWeight:      600,
        lineHeight:      1.30,
        letterSpacing:   '0.8px',
        textTransform:   'uppercase',
        whiteSpace:      'nowrap',
        flexShrink:      0,
        backgroundColor: style.background,
        color:           style.color,
      }}
    >
      {formatLabel(status)}
    </span>
  );
}
