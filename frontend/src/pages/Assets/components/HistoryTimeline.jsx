export default function HistoryTimeline({ items = [] }) {
  if (!items || items.length === 0) {
    return (
      <div className="py-6 text-center">
        <p className="text-sm font-medium text-slate-500">No history available.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-5 top-0 bottom-0 w-px" style={{ backgroundColor: 'var(--color-hairline)' }} aria-hidden="true" />
      <ul className="space-y-6 py-4">
        {items.map((item, idx) => {
          const dot = (
            item.status === 'ACTIVE' || item.status === 'IN_PROGRESS' ? 'var(--color-status-allocated)' :
            item.status === 'OVERDUE' || item.status === 'REJECTED' ? 'var(--color-semantic-error)' :
            item.status === 'RETURNED' || item.status === 'RESOLVED' ? 'var(--color-status-available)' :
            'var(--color-ink-tertiary)'
          );
          return (
            <li key={idx} className="relative pl-12">
              <div
                className="absolute left-3.5 top-1 h-3 w-3 rounded-full border-2"
                style={{ backgroundColor: dot, borderColor: 'var(--color-surface-2)', boxShadow: `0 0 0 2px var(--color-hairline)` }}
                aria-hidden="true"
              />
              <div
                className="rounded-lg px-4 py-3 shadow-sm"
                style={{ backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-hairline)' }}
              >
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <span className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>{item.label}</span>
                  {item.status && (
                    <span
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide"
                      style={{ backgroundColor: 'var(--color-surface-3)', color: 'var(--color-ink-subtle)' }}
                    >
                      {item.status.replace('_', ' ')}
                    </span>
                  )}
                </div>
                {item.timestamp && (
                  <p className="mt-1 text-xs" style={{ color: 'var(--color-ink-subtle)' }}>{item.timestamp}</p>
                )}
                {item.detail && (
                  <div className="mt-2.5 pt-2.5 text-xs" style={{ borderTop: '1px solid var(--color-hairline)', color: 'var(--color-ink-muted)' }}>
                    {item.detail}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
