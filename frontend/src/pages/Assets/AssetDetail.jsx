import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft, Package, Hash, MapPin, Calendar, DollarSign,
  BookOpen, Wrench, Clock, User, AlertCircle, Loader2,
  CheckCircle2, XCircle, RotateCcw, Tag,
} from 'lucide-react';
import { getAssetById } from '../../api/assetApi';
import StatusBadge from './components/StatusBadge';
import HistoryTimeline from './components/HistoryTimeline';

// ─── Allocation status styles ─────────────────────────────────────────────────
const ALLOC_STATUS = {
  ACTIVE:   { label: 'Active',   cls: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' },
  RETURNED: { label: 'Returned', cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
  OVERDUE:  { label: 'Overdue',  cls: 'bg-red-50 text-red-700 ring-1 ring-red-200' },
};

// ─── Maintenance priority styles ──────────────────────────────────────────────
const PRIORITY_STYLES = {
  LOW:      'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
  MEDIUM:   'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  HIGH:     'bg-orange-50 text-orange-700 ring-1 ring-orange-200',
  CRITICAL: 'bg-red-50 text-red-700 ring-1 ring-red-200',
};

// ─── Maintenance status styles ────────────────────────────────────────────────
const MAINT_STATUS = {
  PENDING_APPROVAL:    { label: 'Pending Approval',    cls: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200' },
  APPROVED:            { label: 'Approved',            cls: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' },
  TECHNICIAN_ASSIGNED: { label: 'Technician Assigned', cls: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200' },
  IN_PROGRESS:         { label: 'In Progress',         cls: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
  RESOLVED:            { label: 'Resolved',            cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
  REJECTED:            { label: 'Rejected',            cls: 'bg-red-50 text-red-700 ring-1 ring-red-200' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function Pill({ label, cls }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5 py-2.5 border-b border-slate-100 last:border-0">
      <Icon className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <span className="text-xs text-slate-500 block">{label}</span>
        <span className="text-sm font-medium text-slate-800 mt-0.5 block break-words">{value || '—'}</span>
      </div>
    </div>
  );
}

// ─── Allocation Timeline ──────────────────────────────────────────────────────
function AllocationHistory({ allocations }) {
  const timelineItems = (allocations || []).map(a => {
    const timeInfo = [
      `Allocated: ${formatDate(a.allocatedAt)}`,
      a.expectedReturn ? `Due: ${formatDate(a.expectedReturn)}` : null,
      a.returnedAt ? `Returned: ${formatDate(a.returnedAt)}` : null
    ].filter(Boolean).join(' · ');

    const detailEl = (a.returnCondition || a.returnNotes) ? (
      <div className="space-y-0.5">
        {a.returnCondition && (
          <p><span className="font-medium text-slate-500">Condition at return:</span> {a.returnCondition}</p>
        )}
        {a.returnNotes && (
          <p><span className="font-medium text-slate-500">Notes:</span> {a.returnNotes}</p>
        )}
      </div>
    ) : null;

    return {
      label: a.user?.name ?? 'Unknown user',
      timestamp: timeInfo,
      status: a.status,
      detail: detailEl
    };
  });

  return <HistoryTimeline items={timelineItems} />;
}

// ─── Maintenance History Table ────────────────────────────────────────────────
function MaintenanceHistory({ requests }) {
  if (!requests || requests.length === 0) {
    return (
      <div className="py-12 text-center">
        <Wrench className="h-8 w-8 text-slate-200 mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-500">No maintenance history for this asset.</p>
        <p className="text-xs text-slate-400 mt-1">Maintenance requests will appear here once created.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-100 text-sm" aria-label="Maintenance history">
        <thead>
          <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <th className="px-4 py-3">Issue</th>
            <th className="px-4 py-3">Priority</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Requested</th>
            <th className="px-4 py-3">Technician</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {requests.map((m) => {
            const statusInfo = MAINT_STATUS[m.status] ?? { label: m.status, cls: 'bg-slate-100 text-slate-500 ring-1 ring-slate-200' };
            const priorityCls = PRIORITY_STYLES[m.priority] ?? 'bg-slate-100 text-slate-500 ring-1 ring-slate-200';
            return (
              <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-800 line-clamp-2 max-w-xs">{m.issueDescription}</p>
                  {m.resolvedNotes && (
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">✓ {m.resolvedNotes}</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Pill label={m.priority} cls={priorityCls} />
                </td>
                <td className="px-4 py-3">
                  <Pill label={statusInfo.label} cls={statusInfo.cls} />
                </td>
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                  {formatDate(m.createdAt)}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {m.technician?.name ? (
                    <span className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      {m.technician.name}
                    </span>
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
/**
 * AssetDetail — Screen 4 (Asset Core, Member 2)
 * GET /api/v1/assets/:id — full asset + allocation history + maintenance history
 */
export default function AssetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('allocations'); // 'allocations' | 'maintenance'

  useEffect(() => {
    if (!id) return;
    async function fetchAsset() {
      setLoading(true);
      setError('');
      try {
        const res = await getAssetById(id);
        // standard envelope: { success: true, data: { ...asset, allocations: [], maintenanceReqs: [] } }
        const data = res.data?.data ?? res.data;
        setAsset(data);
      } catch (err) {
        const msg = err?.response?.data?.error?.message || err?.response?.data?.message;
        if (err?.response?.status === 404) {
          setError('Asset not found.');
        } else if (!err?.response) {
          setError('Cannot reach the server. Is the backend running?');
        } else {
          setError(msg || 'Failed to load asset details.');
        }
      } finally {
        setLoading(false);
      }
    }
    fetchAsset();
  }, [id]);

  const tabs = [
    { key: 'allocations', label: 'Allocation History', icon: RotateCcw, count: asset?.allocations?.length },
    { key: 'maintenance', label: 'Maintenance History', icon: Wrench, count: asset?.maintenanceReqs?.length },
  ];

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mx-auto mb-3" />
          <p className="text-sm text-slate-500">Loading asset details…</p>
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="text-center max-w-sm">
          <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-slate-800">{error}</h2>
          <button
            onClick={() => navigate('/assets')}
            className="mt-4 text-sm text-indigo-600 hover:underline"
          >
            ← Back to Asset Directory
          </button>
        </div>
      </div>
    );
  }

  if (!asset) return null;

  const allocations = asset.allocations ?? [];
  const maintenanceReqs = asset.maintenanceReqs ?? asset.maintenanceRequests ?? [];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate('/assets')}
            className="text-slate-400 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-indigo-500 rounded transition-colors p-0.5"
            aria-label="Back to Asset Directory"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Package className="h-5 w-5 text-indigo-600 flex-shrink-0" aria-hidden="true" />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-sm font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {asset.assetTag}
                </span>
                <h1 className="text-lg font-semibold text-slate-900 truncate">{asset.name}</h1>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {asset.category?.name ?? '—'}
                {asset.department?.name ? ` · ${asset.department.name}` : ''}
              </p>
            </div>
          </div>
          <div className="flex-shrink-0">
            <StatusBadge status={asset.status} />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">
        {/* ── Info cards grid ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Identity card */}
          <div className="bg-white border border-slate-200 rounded-lg px-5 py-4">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Identity</h2>
            <InfoRow icon={Tag}      label="Asset Tag"     value={asset.assetTag} />
            <InfoRow icon={Hash}     label="Serial Number" value={asset.serialNumber} />
            <InfoRow icon={Package}  label="Category"      value={asset.category?.name} />
          </div>

          {/* Location & Condition card */}
          <div className="bg-white border border-slate-200 rounded-lg px-5 py-4">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Location</h2>
            <InfoRow icon={MapPin}   label="Location"    value={asset.location} />
            <InfoRow icon={Package}  label="Condition"   value={asset.condition} />
            <InfoRow icon={Package}  label="Department"  value={asset.department?.name} />
          </div>

          {/* Acquisition card */}
          <div className="bg-white border border-slate-200 rounded-lg px-5 py-4">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Acquisition</h2>
            <InfoRow icon={Calendar}    label="Acquired"  value={formatDate(asset.acquisitionDate)} />
            <InfoRow icon={DollarSign}  label="Cost"      value={asset.acquisitionCost != null ? `₹${Number(asset.acquisitionCost).toLocaleString('en-IN')}` : null} />
            <div className="flex items-start gap-2.5 py-2.5">
              <BookOpen className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-xs text-slate-500 block">Bookable</span>
                {asset.isBookable ? (
                  <span className="flex items-center gap-1 text-sm font-medium text-indigo-600 mt-0.5">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Yes
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-sm font-medium text-slate-400 mt-0.5">
                    <XCircle className="h-3.5 w-3.5" /> No
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Photo (if present) ───────────────────────────────────────────── */}
        {asset.photoUrl && (
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Photo</h2>
            <img
              src={asset.photoUrl}
              alt={`Photo of ${asset.name}`}
              className="max-h-48 rounded-md object-contain border border-slate-100"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
        )}

        {/* ── Tabs ─────────────────────────────────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-slate-200" role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                role="tab"
                aria-selected={activeTab === tab.key}
                aria-controls={`tabpanel-${tab.key}`}
                id={`tab-${tab.key}`}
                onClick={() => setActiveTab(tab.key)}
                className={[
                  'flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500',
                  activeTab === tab.key
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300',
                ].join(' ')}
              >
                <tab.icon className="h-4 w-4" aria-hidden="true" />
                {tab.label}
                {tab.count > 0 && (
                  <span className={`text-xs rounded-full px-2 py-0.5 font-medium ${
                    activeTab === tab.key
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab panels */}
          <div
            role="tabpanel"
            id="tabpanel-allocations"
            aria-labelledby="tab-allocations"
            hidden={activeTab !== 'allocations'}
            className="px-6 py-4"
          >
            <AllocationHistory allocations={allocations} />
          </div>

          <div
            role="tabpanel"
            id="tabpanel-maintenance"
            aria-labelledby="tab-maintenance"
            hidden={activeTab !== 'maintenance'}
          >
            <MaintenanceHistory requests={maintenanceReqs} />
          </div>
        </div>

        {/* ── Meta ─────────────────────────────────────────────────────────── */}
        <p className="text-xs text-slate-400 text-right">
          Asset registered: {formatDate(asset.createdAt)}
        </p>
      </div>
    </div>
  );
}
