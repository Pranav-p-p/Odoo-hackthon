import React, { useState, useEffect } from 'react';
import {
  FileBarChart2,
  Download,
  AlertTriangle,
  RefreshCw,
  Clock,
  CheckCircle,
  BarChart,
} from 'lucide-react';
import {
  getUtilization,
  getMaintenanceFrequency,
  getIdleAssets,
  getMostUsed,
  getDueForMaintenance,
  getDepartmentAllocation,
  getBookingHeatmap,
  exportReport,
} from '../../api/reports.api';

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  // Report States
  const [utilization, setUtilization] = useState([]);
  const [_maintenance, setMaintenance] = useState([]);
  const [idleAssets, setIdleAssets] = useState([]);
  const [mostUsed, setMostUsed] = useState([]);
  const [dueMaintenance, setDueMaintenance] = useState([]);
  const [_breakdown, setBreakdown] = useState([]);
  const [heatmap, setHeatmap] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [
        utilRes,
        maintRes,
        idleRes,
        mostUsedRes,
        dueRes,
        breakdownRes,
        heatmapRes,
      ] = await Promise.all([
        getUtilization(),
        getMaintenanceFrequency(),
        getIdleAssets(),
        getMostUsed(),
        getDueForMaintenance(),
        getDepartmentAllocation(),
        getBookingHeatmap(),
      ]);

      if (utilRes.success) setUtilization(utilRes.data);
      if (maintRes.success) setMaintenance(maintRes.data);
      if (idleRes.success) setIdleAssets(idleRes.data);
      if (mostUsedRes.success) setMostUsed(mostUsedRes.data);
      if (dueRes.success) setDueMaintenance(dueRes.data);
      if (breakdownRes.success) setBreakdown(breakdownRes.data);
      if (heatmapRes.success) setHeatmap(heatmapRes.data);
    } catch (err) {
      console.error('[ReportsPage] Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExport = async (type) => {
    try {
      setDownloading(true);
      const blob = await exportReport(type);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `assetflow_${type}_report.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error('[ReportsPage] CSV export failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  const getHeatmapStyle = (count) => {
    if (count === 0) return { backgroundColor: 'var(--color-surface-2)', color: 'transparent' };
    if (count < 3)  return { backgroundColor: 'rgba(94,106,210,0.14)', color: 'var(--color-primary-hover)' };
    if (count < 6)  return { backgroundColor: 'rgba(94,106,210,0.30)', color: 'var(--color-primary-hover)' };
    return { backgroundColor: 'var(--color-primary)', color: '#ffffff', fontWeight: 700 };
  };

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 16 }}>
        <RefreshCw size={28} color='var(--color-primary)' style={{ animation: 'spin 1s linear infinite' }} />
        <p className="type-body-sm" style={{ color: 'var(--color-ink-subtle)' }}>Compiling analytics dashboards…</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto' }}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <FileBarChart2 size={18} color='var(--color-primary)' />
          <div>
            <h1 className="type-display-md" style={{ color: 'var(--color-ink)', margin: 0 }}>Reports &amp; Analytics</h1>
            <p className="type-body-sm" style={{ color: 'var(--color-ink-subtle)', marginTop: 6 }}>Export system data and visualize resource allocation patterns.</p>
          </div>
        </div>
        <button onClick={fetchData} className="btn-secondary">
          <RefreshCw size={13} />
          Refresh Data
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── CSV Export cards ──────────────────────────────────────────────── */}
      <div className="feature-card">
        <p className="type-eyebrow" style={{ color: 'var(--color-ink-subtle)', marginBottom: 16 }}>Export Raw Data Logs (CSV)</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
          {[
            { type: 'utilization', label: 'Utilization Stats' },
            { type: 'maintenance', label: 'Maintenance Log' },
            { type: 'allocation', label: 'Allocation History' },
            { type: 'booking',    label: 'Shared Bookings' },
          ].map(item => (
            <button
              key={item.type}
              onClick={() => handleExport(item.type)}
              disabled={downloading}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', backgroundColor: 'var(--color-surface-2)', border: '1px solid #23252a', borderRadius: 8, cursor: 'pointer', transition: 'background-color var(--duration-fast) var(--ease-standard)' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1a1b1c'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--color-surface-2)'}
            >
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-ink)' }}>{item.label}</span>
              <Download size={14} color='var(--color-primary)' />
            </button>
          ))}
        </div>
      </div>

      {/* ── Main grid ────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))', gap: 20 }}>

        {/* Utilization by Department */}
        <div className="feature-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <BarChart size={16} color='var(--color-ink-subtle)' />
            <h2 className="type-card-title" style={{ margin: 0, color: 'var(--color-ink)' }}>Department Utilization</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {utilization.map(item => (
              <div key={item.departmentId}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 500, color: 'var(--color-ink-muted)', marginBottom: 6 }}>
                  <span>{item.departmentName}</span>
                  <span style={{ color: 'var(--color-primary)' }}>{item.utilizationRate}%</span>
                </div>
                <div style={{ width: '100%', backgroundColor: 'var(--color-hairline)', borderRadius: 9999, height: 6 }}>
                  <div style={{ width: `${item.utilizationRate}%`, backgroundColor: 'var(--color-primary)', height: 6, borderRadius: 9999, transition: 'width 0.5s var(--ease-standard)' }} />
                </div>
                <p style={{ fontSize: 11, color: 'var(--color-ink-tertiary)', marginTop: 4 }}>{item.allocatedAssets} / {item.totalAssets} assets assigned</p>
              </div>
            ))}
          </div>
        </div>

        {/* Most Used Assets */}
        <div className="feature-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <CheckCircle size={16} color='var(--color-ink-subtle)' />
            <h2 className="type-card-title" style={{ margin: 0, color: 'var(--color-ink)' }}>Top High-Demand Assets</h2>
          </div>
          <div className="data-table">
            <table style={{ minWidth: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-surface-2)' }}>
                  {['Tag','Name','Usage'].map(h => <th key={h} className="data-table-header">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {mostUsed.slice(0, 5).map(asset => (
                  <tr key={asset.id} className="data-table-row">
                    <td style={{ padding: '10px 14px' }}>
                      <span className="type-mono" style={{ color: 'var(--color-ink-subtle)', backgroundColor: 'var(--color-surface-2)', padding: '2px 6px', borderRadius: 4 }}>{asset.assetTag}</span>
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--color-ink-muted)' }}>{asset.name}</td>
                    <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--color-ink-subtle)', fontFamily: 'var(--font-mono)' }}>
                      {asset.totalUsage}× (A:{asset.allocationCount} B:{asset.bookingCount})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Idle Assets */}
        <div className="feature-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <Clock size={16} color='var(--color-ink-subtle)' />
            <h2 className="type-card-title" style={{ margin: 0, color: 'var(--color-ink)' }}>Idle Assets (30+ Days)</h2>
          </div>
          <div style={{ maxHeight: 260, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 0 }}>
            {idleAssets.length === 0 ? (
              <p className="type-body-sm" style={{ color: 'var(--color-ink-subtle)', padding: '16px 0', textAlign: 'center' }}>No idle assets flagged.</p>
            ) : idleAssets.map(asset => (
              <div key={asset.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #23252a' }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-ink)', margin: 0 }}>{asset.name}</p>
                  <p className="type-mono" style={{ color: 'var(--color-ink-tertiary)', marginTop: 2 }}>{asset.assetTag} — {asset.location}</p>
                </div>
                <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 9999, backgroundColor: 'var(--color-status-maintenance-bg)', color: 'var(--color-status-maintenance)' }}>
                  Idle {new Date(asset.idleSince).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Due for maintenance */}
        <div className="feature-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <AlertTriangle size={16} color='var(--color-ink-subtle)' />
            <h2 className="type-card-title" style={{ margin: 0, color: 'var(--color-ink)' }}>Proactive Maintenance</h2>
          </div>
          <div style={{ maxHeight: 260, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 0 }}>
            {dueMaintenance.length === 0 ? (
              <p className="type-body-sm" style={{ color: 'var(--color-ink-subtle)', padding: '16px 0', textAlign: 'center' }}>All assets are in good condition.</p>
            ) : dueMaintenance.map(asset => (
              <div key={asset.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #23252a' }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-ink)', margin: 0 }}>{asset.name}</p>
                  <p className="type-mono" style={{ color: 'var(--color-ink-tertiary)', marginTop: 2 }}>{asset.assetTag} — {asset.location}</p>
                </div>
                <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 9999, backgroundColor: 'rgba(248,81,73,0.14)', color: 'var(--color-semantic-error)' }}>
                  {asset.condition} / {asset.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Booking Heatmap ──────────────────────────────────────────────── */}
      <div className="feature-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <Clock size={16} color='var(--color-ink-subtle)' />
          <h2 className="type-card-title" style={{ margin: 0, color: 'var(--color-ink)' }}>Booking Heatmap (Hour × Day)</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ display: 'inline-grid', gridTemplateColumns: 'auto repeat(24, minmax(28px, 1fr))', gap: 4, minWidth: 700, textAlign: 'center' }}>
            {/* Hour labels */}
            <div />
            {Array.from({ length: 24 }).map((_, h) => (
              <div key={h} style={{ fontSize: 9, fontWeight: 600, color: 'var(--color-ink-tertiary)', paddingBottom: 2 }}>{h}h</div>
            ))}
            {/* Day rows */}
            {heatmap.map((row, dayIdx) => (
              <React.Fragment key={dayIdx}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-ink-subtle)', paddingRight: 8, display: 'flex', alignItems: 'center', textAlign: 'left', whiteSpace: 'nowrap' }}>
                  {daysOfWeek[dayIdx]}
                </div>
                {row.map((count, hourIdx) => (
                  <div
                    key={hourIdx}
                    style={{ height: 28, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, ...getHeatmapStyle(count) }}
                    title={`${daysOfWeek[dayIdx]} at ${hourIdx}:00 — ${count} bookings`}
                  >
                    {count > 0 && count}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
        {/* Legend */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 16, flexWrap: 'wrap' }}>
          {[
            { style: { backgroundColor: 'var(--color-surface-2)' }, label: '0 bookings' },
            { style: { backgroundColor: 'rgba(94,106,210,0.14)' }, label: '1–2' },
            { style: { backgroundColor: 'rgba(94,106,210,0.30)' }, label: '3–5' },
            { style: { backgroundColor: 'var(--color-primary)' }, label: '6+' },
          ].map(l => (
            <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--color-ink-subtle)' }}>
              <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 3, ...l.style }} />
              {l.label}
            </span>
          ))}
        </div>
      </div>

      </div>{/* end column flex */}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
