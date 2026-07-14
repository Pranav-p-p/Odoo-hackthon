import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Package, Hash, MapPin, Calendar, DollarSign,
  BookOpen, Wrench, User, AlertCircle, Loader2,
  CheckCircle2, XCircle, RotateCcw, Tag,
} from 'lucide-react';
import { getAssetById } from '../../api/assetApi';
import StatusBadge from './components/StatusBadge';
import HistoryTimeline from './components/HistoryTimeline';

// ─── Allocation status styles ─────────────────────────────────────────────────
// ─── Allocation status styles ─────────────────────────────────────────────────

// ─── Maintenance priority styles ──────────────────────────────────────────────
const PRIORITY_STYLES = {
  LOW:      { bg: 'var(--color-status-disposed-bg)', color: 'var(--color-status-disposed)' },
  MEDIUM:   { bg: 'var(--color-status-maintenance-bg)', color: 'var(--color-status-maintenance)' },
  HIGH:     { bg: 'rgba(255,123,114,0.16)', color: '#ff7b72' },
  CRITICAL: { bg: 'rgba(248,81,73,0.14)', color: 'var(--color-semantic-error)' },
};

// ─── Maintenance status styles ────────────────────────────────────────────────
const MAINT_STATUS = {
  PENDING_APPROVAL:    { label: 'Pending Approval',    cls: { bg: 'var(--color-status-disposed-bg)', color: 'var(--color-status-disposed)' } },
  APPROVED:            { label: 'Approved',            cls: { bg: 'var(--color-status-allocated-bg)', color: 'var(--color-status-allocated)' } },
  TECHNICIAN_ASSIGNED: { label: 'Technician Assigned', cls: { bg: 'rgba(163,113,247,0.16)', color: '#a371f7' } },
  IN_PROGRESS:         { label: 'In Progress',         cls: { bg: 'var(--color-status-maintenance-bg)', color: 'var(--color-status-maintenance)' } },
  RESOLVED:            { label: 'Resolved',            cls: { bg: 'var(--color-status-available-bg)', color: 'var(--color-status-available)' } },
  REJECTED:            { label: 'Rejected',            cls: { bg: 'rgba(248,81,73,0.14)', color: 'var(--color-semantic-error)' } },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function Pill({ label, cls }) {
  const style = typeof cls === 'object' ? cls : { bg: 'var(--color-status-disposed-bg)', color: 'var(--color-status-disposed)' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', borderRadius: 9999, padding: '2px 8px', fontSize: 11, fontWeight: 600, backgroundColor: style.bg, color: style.color }}>
      {label}
    </span>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderBottom: '1px solid #23252a' }}>
      <Icon size={16} color='var(--color-ink-subtle)' style={{ marginTop: 2, flexShrink: 0 }} aria-hidden="true" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 12, color: 'var(--color-ink-subtle)', display: 'block' }}>{label}</span>
        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-ink)', marginTop: 2, display: 'block', wordBreak: 'break-word' }}>{value || '—'}</span>
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4 }}>
        {a.returnCondition && (
          <p style={{ margin: 0, fontSize: 13, color: '#c9d1d9' }}><span style={{ fontWeight: 500, color: 'var(--color-ink-subtle)' }}>Condition at return:</span> {a.returnCondition}</p>
        )}
        {a.returnNotes && (
          <p style={{ margin: 0, fontSize: 13, color: '#c9d1d9' }}><span style={{ fontWeight: 500, color: 'var(--color-ink-subtle)' }}>Notes:</span> {a.returnNotes}</p>
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
      <div style={{ padding: '48px 0', textAlign: 'center' }}>
        <Wrench size={32} color='var(--color-hairline-strong)' style={{ margin: '0 auto 12px' }} />
        <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-ink-subtle)', margin: 0 }}>No maintenance history for this asset.</p>
        <p style={{ fontSize: 12, color: 'var(--color-ink-tertiary)', marginTop: 4 }}>Maintenance requests will appear here once created.</p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto', border: '1px solid #23252a', borderRadius: 8 }}>
      <table style={{ minWidth: '100%', borderCollapse: 'collapse', fontSize: 13 }} aria-label="Maintenance history">
        <thead>
          <tr style={{ backgroundColor: 'var(--color-surface-2)', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--color-ink-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #23252a' }}>
            <th style={{ padding: '12px 16px' }}>Issue</th>
            <th style={{ padding: '12px 16px' }}>Priority</th>
            <th style={{ padding: '12px 16px' }}>Status</th>
            <th style={{ padding: '12px 16px' }}>Requested</th>
            <th style={{ padding: '12px 16px' }}>Technician</th>
          </tr>
        </thead>
        <tbody style={{ backgroundColor: 'var(--color-surface-1)' }}>
          {requests.map((m) => {
            const statusInfo = MAINT_STATUS[m.status] ?? { label: m.status, cls: { bg: 'var(--color-status-disposed-bg)', color: 'var(--color-status-disposed)' } };
            const priorityCls = PRIORITY_STYLES[m.priority] ?? { bg: 'var(--color-status-disposed-bg)', color: 'var(--color-status-disposed)' };
            return (
              <tr key={m.id} style={{ borderBottom: '1px solid #23252a' }}>
                <td style={{ padding: '12px 16px' }}>
                  <p style={{ fontWeight: 500, color: 'var(--color-ink)', margin: 0 }}>{m.issueDescription}</p>
                  {m.resolvedNotes && (
                    <p style={{ fontSize: 11, color: 'var(--color-ink-tertiary)', marginTop: 2 }}>✓ {m.resolvedNotes}</p>
                  )}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <Pill label={m.priority} cls={priorityCls} />
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <Pill label={statusInfo.label} cls={statusInfo.cls} />
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--color-ink-subtle)', whiteSpace: 'nowrap' }}>
                  {formatDate(m.createdAt)}
                </td>
                <td style={{ padding: '12px 16px', color: '#c9d1d9' }}>
                  {m.technician?.name ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <User size={14} color='var(--color-ink-subtle)' />
                      {m.technician.name}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--color-hairline-strong)' }}>—</span>
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
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-canvas)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={32} color='var(--color-primary)' style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ fontSize: 14, color: 'var(--color-ink-subtle)', margin: 0 }}>Loading asset details…</p>
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-canvas)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <div style={{ textAlign: 'center', maxWidth: 384 }}>
          <AlertCircle size={40} color='var(--color-semantic-error)' style={{ margin: '0 auto 12px' }} />
          <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-ink)', margin: '0 0 16px' }}>{error}</h2>
          <button onClick={() => navigate('/assets')} style={{ fontSize: 14, color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer' }}>
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
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-canvas)', color: '#c9d1d9' }}>
      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div style={{ backgroundColor: 'var(--color-surface-1)', borderBottom: '1px solid #23252a', padding: '16px 24px' }}>
        <div style={{ maxWidth: 1024, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => navigate('/assets')}
            style={{ color: 'var(--color-ink-subtle)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
            aria-label="Back to Asset Directory"
          >
            <ChevronLeft size={20} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
            <Package size={20} color='var(--color-primary)' style={{ flexShrink: 0 }} aria-hidden="true" />
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600, color: 'var(--color-ink-subtle)', backgroundColor: 'var(--color-hairline)', padding: '2px 8px', borderRadius: 4 }}>
                  {asset.assetTag}
                </span>
                <h1 style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-ink)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{asset.name}</h1>
              </div>
              <p style={{ fontSize: 12, color: 'var(--color-ink-subtle)', margin: '2px 0 0' }}>
                {asset.category?.name ?? '—'}
                {asset.department?.name ? ` · ${asset.department.name}` : ''}
              </p>
            </div>
          </div>
          <div style={{ flexShrink: 0 }}>
            <StatusBadge status={asset.status} />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1024, margin: '0 auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* ── Info cards grid ──────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>

          {/* Identity card */}
          <div style={{ backgroundColor: 'var(--color-surface-1)', border: '1px solid #23252a', borderRadius: 8, padding: '16px 20px' }}>
            <h2 style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-ink-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>Identity</h2>
            <InfoRow icon={Tag}      label="Asset Tag"     value={asset.assetTag} />
            <InfoRow icon={Hash}     label="Serial Number" value={asset.serialNumber} />
            <InfoRow icon={Package}  label="Category"      value={asset.category?.name} />
          </div>

          {/* Location & Condition card */}
          <div style={{ backgroundColor: 'var(--color-surface-1)', border: '1px solid #23252a', borderRadius: 8, padding: '16px 20px' }}>
            <h2 style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-ink-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>Location</h2>
            <InfoRow icon={MapPin}   label="Location"    value={asset.location} />
            <InfoRow icon={Package}  label="Condition"   value={asset.condition} />
            <InfoRow icon={Package}  label="Department"  value={asset.department?.name} />
          </div>

          {/* Acquisition card */}
          <div style={{ backgroundColor: 'var(--color-surface-1)', border: '1px solid #23252a', borderRadius: 8, padding: '16px 20px' }}>
            <h2 style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-ink-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>Acquisition</h2>
            <InfoRow icon={Calendar}    label="Acquired"  value={formatDate(asset.acquisitionDate)} />
            <InfoRow icon={DollarSign}  label="Cost"      value={asset.acquisitionCost != null ? `₹${Number(asset.acquisitionCost).toLocaleString('en-IN')}` : null} />
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0' }}>
              <BookOpen size={16} color='var(--color-ink-subtle)' style={{ marginTop: 2, flexShrink: 0 }} />
              <div>
                <span style={{ fontSize: 12, color: 'var(--color-ink-subtle)', display: 'block' }}>Bookable</span>
                {asset.isBookable ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14, fontWeight: 500, color: 'var(--color-primary)', marginTop: 2 }}>
                    <CheckCircle2 size={14} /> Yes
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14, fontWeight: 500, color: 'var(--color-ink-subtle)', marginTop: 2 }}>
                    <XCircle size={14} /> No
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Photo (if present) ───────────────────────────────────────────── */}
        {asset.photoUrl && (
          <div style={{ backgroundColor: 'var(--color-surface-1)', border: '1px solid #23252a', borderRadius: 8, padding: 16 }}>
            <h2 style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-ink-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px' }}>Photo</h2>
            <img
              src={asset.photoUrl}
              alt={`Photo of ${asset.name}`}
              style={{ maxHeight: 192, borderRadius: 6, objectFit: 'contain', border: '1px solid #23252a' }}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
        )}

        {/* ── Tabs ─────────────────────────────────────────────────────────── */}
        <div style={{ backgroundColor: 'var(--color-surface-1)', border: '1px solid #23252a', borderRadius: 12, overflow: 'hidden' }}>
          {/* Tab bar */}
          <div style={{ display: 'flex', borderBottom: '1px solid #23252a' }} role="tablist">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`tabpanel-${tab.key}`}
                  id={`tab-${tab.key}`}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', fontSize: 14, fontWeight: 500,
                    backgroundColor: 'transparent', border: 'none', cursor: 'pointer',
                    borderBottom: isActive ? '2px solid #5e6ad2' : '2px solid transparent',
                    color: isActive ? 'var(--color-ink)' : 'var(--color-ink-subtle)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <tab.icon size={16} aria-hidden="true" />
                  {tab.label}
                  {tab.count > 0 && (
                    <span style={{ fontSize: 11, fontWeight: 600, borderRadius: 9999, padding: '2px 6px', backgroundColor: isActive ? 'rgba(94,106,210,0.15)' : 'var(--color-hairline)', color: isActive ? 'var(--color-primary)' : 'var(--color-ink-subtle)' }}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab panels */}
          <div
            role="tabpanel"
            id="tabpanel-allocations"
            aria-labelledby="tab-allocations"
            hidden={activeTab !== 'allocations'}
            style={{ padding: '16px 24px', display: activeTab === 'allocations' ? 'block' : 'none' }}
          >
            <AllocationHistory allocations={allocations} />
          </div>

          <div
            role="tabpanel"
            id="tabpanel-maintenance"
            aria-labelledby="tab-maintenance"
            hidden={activeTab !== 'maintenance'}
            style={{ padding: '16px 24px', display: activeTab === 'maintenance' ? 'block' : 'none' }}
          >
            <MaintenanceHistory requests={maintenanceReqs} />
          </div>
        </div>

        {/* ── Meta ─────────────────────────────────────────────────────────── */}
        <p style={{ fontSize: 12, color: 'var(--color-ink-tertiary)', textAlign: 'right', margin: 0 }}>
          Asset registered: {formatDate(asset.createdAt)}
        </p>
      </div>
    </div>
  );
}
