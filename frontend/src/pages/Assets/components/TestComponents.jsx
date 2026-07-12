import { useState } from 'react';
import StatusBadge from './StatusBadge';
import ConflictBanner from './ConflictBanner';
import AssetSelector from './AssetSelector';
import HistoryTimeline from './HistoryTimeline';
import RoleGate from './RoleGate';

export default function TestComponents() {
  const [selectedAsset, setSelectedAsset] = useState(null);

  const testTimelineItems = [
    { label: 'Allocated to John Doe', timestamp: 'Oct 12, 2023', status: 'ACTIVE', detail: 'Expected return: Dec 1, 2023' },
    { label: 'Maintenance Request', timestamp: 'Sep 05, 2023', status: 'RESOLVED', detail: 'Screen replacement completed.' },
    { label: 'Allocated to Jane Smith', timestamp: 'Jan 10, 2023', status: 'RETURNED', detail: 'Returned in Good condition.' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8 space-y-12 pb-32">
      <div className="max-w-2xl mx-auto space-y-12">
        
        <section>
          <h2 className="text-sm font-semibold text-slate-800 mb-4 border-b pb-2">1. StatusBadge</h2>
          <div className="space-y-4">
            <div className="flex gap-2 items-center flex-wrap">
              <span className="w-24 text-xs text-slate-500">Asset:</span>
              <StatusBadge type="asset" status="AVAILABLE" />
              <StatusBadge type="asset" status="ALLOCATED" />
              <StatusBadge type="asset" status="RESERVED" />
              <StatusBadge type="asset" status="UNDER_MAINTENANCE" />
              <StatusBadge type="asset" status="LOST" />
            </div>
            <div className="flex gap-2 items-center flex-wrap">
              <span className="w-24 text-xs text-slate-500">Allocation:</span>
              <StatusBadge type="allocation" status="ACTIVE" />
              <StatusBadge type="allocation" status="RETURNED" />
              <StatusBadge type="allocation" status="OVERDUE" />
            </div>
            <div className="flex gap-2 items-center flex-wrap">
              <span className="w-24 text-xs text-slate-500">Transfer:</span>
              <StatusBadge type="transfer" status="REQUESTED" />
              <StatusBadge type="transfer" status="APPROVED" />
              <StatusBadge type="transfer" status="REJECTED" />
              <StatusBadge type="transfer" status="COMPLETED" />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-slate-800 mb-4 border-b pb-2">2. ConflictBanner</h2>
          <ConflictBanner currentHolder={{ name: 'Alice Engineering', department: 'R&D' }} />
        </section>

        <section>
          <h2 className="text-sm font-semibold text-slate-800 mb-4 border-b pb-2">3. AssetSelector</h2>
          <AssetSelector value={selectedAsset} onChange={setSelectedAsset} />
          <p className="text-xs text-slate-500 mt-2">
            Selected: {selectedAsset ? selectedAsset.name : 'None'}
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-slate-800 mb-4 border-b pb-2">4. HistoryTimeline</h2>
          <HistoryTimeline items={testTimelineItems} />
        </section>

        <section>
          <h2 className="text-sm font-semibold text-slate-800 mb-4 border-b pb-2">5. RoleGate (Mocked User)</h2>
          <div className="p-4 bg-white border border-slate-200 rounded-lg">
            <RoleGate allow={['ADMIN', 'ASSET_MANAGER', 'EMPLOYEE']}>
              <p className="text-sm text-emerald-600">✓ You can see this because your role is allowed.</p>
            </RoleGate>
          </div>
        </section>

      </div>
    </div>
  );
}
