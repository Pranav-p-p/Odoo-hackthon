import { AlertTriangle } from 'lucide-react';

export default function ConflictBanner({ currentHolder }) {
  if (!currentHolder) return null;

  return (
    <div className="flex items-start gap-3 bg-amber-50 border border-amber-300 rounded-lg px-4 py-3">
      <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
      <div className="text-sm">
        <p className="font-semibold text-amber-800">Asset Already Allocated</p>
        <p className="text-amber-700 mt-0.5">
          Already Allocated to <span className="font-medium">{currentHolder.name}</span>
          {currentHolder.department ? ` (${currentHolder.department})` : ''}.
          Direct re-allocation is blocked — submit a transfer request below.
        </p>
      </div>
    </div>
  );
}
