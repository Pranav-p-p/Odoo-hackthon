import { AlertTriangle } from 'lucide-react';

export default function ConflictBanner({ currentHolder }) {
  if (!currentHolder) return null;

  return (
    <div
      className="flex items-start gap-3 rounded-lg px-4 py-3"
      style={{
        backgroundColor: 'var(--color-status-maintenance-bg)',
        border: '1px solid var(--color-status-maintenance)',
      }}
    >
      <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--color-status-maintenance)' }} />
      <div className="text-sm">
        <p className="font-semibold" style={{ color: 'var(--color-ink)' }}>Asset Already Allocated</p>
        <p className="mt-0.5" style={{ color: 'var(--color-ink-muted)' }}>
          Already Allocated to <span className="font-medium">{currentHolder.name}</span>
          {currentHolder.department ? ` (${currentHolder.department})` : ''}.
          Direct re-allocation is blocked — submit a transfer request below.
        </p>
      </div>
    </div>
  );
}
