/**
 * StatusBadge — shared component for Asset Core modules.
 * Handles Asset, Allocation, Transfer, and Maintenance status enums.
 */

const ASSET_STYLES = {
  AVAILABLE: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  ALLOCATED: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  RESERVED: 'bg-purple-50 text-purple-700 ring-1 ring-purple-200',
  UNDER_MAINTENANCE: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  LOST: 'bg-red-50 text-red-700 ring-1 ring-red-200',
  RETIRED: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
  DISPOSED: 'bg-slate-100 text-slate-500 ring-1 ring-slate-200',
};

const ALLOCATION_STYLES = {
  ACTIVE: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  RETURNED: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  OVERDUE: 'bg-red-50 text-red-700 ring-1 ring-red-200',
};

const TRANSFER_STYLES = {
  REQUESTED: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  APPROVED: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  REJECTED: 'bg-red-50 text-red-700 ring-1 ring-red-200',
  COMPLETED: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
};

const MAINTENANCE_STYLES = {
  PENDING_APPROVAL: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  APPROVED: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  TECHNICIAN_ASSIGNED: 'bg-purple-50 text-purple-700 ring-1 ring-purple-200',
  IN_PROGRESS: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  RESOLVED: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  REJECTED: 'bg-red-50 text-red-700 ring-1 ring-red-200',
};

const STYLE_MAP = {
  asset: ASSET_STYLES,
  allocation: ALLOCATION_STYLES,
  transfer: TRANSFER_STYLES,
  maintenance: MAINTENANCE_STYLES,
};

// Formats "UNDER_MAINTENANCE" to "Under Maintenance"
function formatLabel(status) {
  if (!status) return '—';
  return status
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}

export default function StatusBadge({ type = 'asset', status }) {
  const dictionary = STYLE_MAP[type] || STYLE_MAP.asset;
  const styleClass = dictionary[status] ?? 'bg-slate-100 text-slate-500 ring-1 ring-slate-200';
  const label = formatLabel(status);

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${styleClass}`}
    >
      {label}
    </span>
  );
}
