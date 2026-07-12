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
      <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-200" aria-hidden="true" />
      <ul className="space-y-6 py-4">
        {items.map((item, idx) => (
          <li key={idx} className="relative pl-12">
            <div
              className={`absolute left-3.5 top-1 h-3 w-3 rounded-full border-2 border-white ring-2 ${
                item.status === 'ACTIVE' || item.status === 'IN_PROGRESS' ? 'bg-blue-500 ring-blue-300' :
                item.status === 'OVERDUE' || item.status === 'REJECTED' ? 'bg-red-500 ring-red-300' :
                item.status === 'RETURNED' || item.status === 'RESOLVED' ? 'bg-emerald-500 ring-emerald-300' :
                'bg-slate-400 ring-slate-200'
              }`}
              aria-hidden="true"
            />
            <div className="bg-white border border-slate-200 rounded-lg px-4 py-3 shadow-sm">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <span className="text-sm font-semibold text-slate-800">{item.label}</span>
                {item.status && (
                  <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-600 uppercase tracking-wide">
                    {item.status.replace('_', ' ')}
                  </span>
                )}
              </div>
              {item.timestamp && (
                <p className="mt-1 text-xs text-slate-500">{item.timestamp}</p>
              )}
              {item.detail && (
                <div className="mt-2.5 pt-2.5 border-t border-slate-100 text-xs text-slate-600">
                  {item.detail}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
