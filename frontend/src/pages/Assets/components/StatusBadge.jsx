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
  AVAILABLE:           { background: 'rgba(63,185,80,0.14)',   color: '#3fb950' },
  ALLOCATED:           { background: 'rgba(88,166,255,0.14)',  color: '#58a6ff' },
  RESERVED:            { background: 'rgba(94,106,210,0.16)',  color: '#828fff' },
  UNDER_MAINTENANCE:   { background: 'rgba(210,153,34,0.16)',  color: '#d29922' },
  LOST:                { background: 'rgba(248,81,73,0.14)',   color: '#f85149' },
  RETIRED:             { background: 'rgba(139,148,158,0.16)', color: '#8b949e' },
  DISPOSED:            { background: 'rgba(139,148,158,0.16)', color: '#8b949e' },

  /* Allocation statuses */
  ACTIVE:              { background: 'rgba(88,166,255,0.14)',  color: '#58a6ff' },
  RETURNED:            { background: 'rgba(63,185,80,0.14)',   color: '#3fb950' },
  OVERDUE:             { background: 'rgba(248,81,73,0.14)',   color: '#f85149' },

  /* Transfer statuses */
  REQUESTED:           { background: 'rgba(210,153,34,0.16)',  color: '#d29922' },
  APPROVED:            { background: 'rgba(63,185,80,0.14)',   color: '#3fb950' },
  REJECTED:            { background: 'rgba(248,81,73,0.14)',   color: '#f85149' },
  COMPLETED:           { background: 'rgba(139,148,158,0.16)', color: '#8b949e' },

  /* Maintenance statuses */
  PENDING_APPROVAL:    { background: 'rgba(210,153,34,0.16)',  color: '#d29922' },
  TECHNICIAN_ASSIGNED: { background: 'rgba(94,106,210,0.16)',  color: '#828fff' },
  IN_PROGRESS:         { background: 'rgba(88,166,255,0.14)',  color: '#58a6ff' },
  RESOLVED:            { background: 'rgba(63,185,80,0.14)',   color: '#3fb950' },
};

const FALLBACK = { background: 'rgba(139,148,158,0.16)', color: '#8b949e' };

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
