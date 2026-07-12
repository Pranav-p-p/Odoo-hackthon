import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Monitor,
  Key,
  Wrench,
  Calendar,
  ArrowLeftRight,
  AlertTriangle,
  ClipboardCheck,
  FileBarChart2,
  Bell,
  RefreshCw,
} from 'lucide-react';
import { getKpi, getRecentActivity } from '../../api/dashboard.api';
import KpiCard from '../../components/dashboard/KpiCard';
import RecentActivityPanel from '../../components/dashboard/RecentActivityPanel';

/* ─────────────────────────────────────────────────────────────────────────────
   DashboardPage — DESIGN.md dark canvas
   - Canvas (#010102) background
   - KPI cards in 4-up grid at ≥1280px, 2-up tablet, 1-up mobile
   - Quick Actions in feature-card (surface-1)
   - Data protagonist: tables and KPIs front and center
───────────────────────────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const navigate = useNavigate();
  const [kpi, setKpi] = useState({
    assetsAvailable:  0,
    assetsAllocated:  0,
    maintenanceToday: 0,
    upcomingReturns:  0,
    pendingTransfers: 0,
    activeBookings:   0,
    overdueReturns:   0,
  });
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [kpiRes, logsRes] = await Promise.all([getKpi(), getRecentActivity()]);
      if (kpiRes.success)  setKpi(kpiRes.data);
      if (logsRes.success) setLogs(logsRes.data);
    } catch (err) {
      console.error('[Dashboard] Error:', err);
      setError('Could not connect to the server. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  /* ── Loading state ─────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        minHeight:      '60vh',
        flexDirection:  'column',
        gap:            16,
      }}>
        <RefreshCw
          size={28}
          color="#5e6ad2"
          style={{ animation: 'spin 1s linear infinite' }}
        />
        <p className="type-body-sm" style={{ color: '#8a8f98' }}>
          Loading dashboard intelligence…
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto' }}>

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div style={{
        display:        'flex',
        alignItems:     'flex-start',
        justifyContent: 'space-between',
        gap:            16,
        marginBottom:   32,
        flexWrap:       'wrap',
      }}>
        <div>
          <h1 className="type-display-lg" style={{ color: '#f7f8f8', margin: 0 }}>Dashboard</h1>
          <p className="type-body-sm" style={{ color: '#8a8f98', marginTop: 6 }}>
            Real-time tracking of organization assets and resource activities.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="btn-secondary"
          style={{ flexShrink: 0 }}
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* ── Backend error banner ──────────────────────────────────────────── */}
      {error && (
        <div style={{
          display:         'flex',
          alignItems:      'flex-start',
          gap:             12,
          backgroundColor: 'rgba(248,81,73,0.10)',
          border:          '1px solid rgba(248,81,73,0.25)',
          borderRadius:    12,
          padding:         '16px 20px',
          marginBottom:    32,
          color:           '#f85149',
        }}>
          <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ fontWeight: 600, fontSize: 14, margin: 0 }}>Backend Connection Issue</p>
            <p style={{ fontSize: 13, marginTop: 4, color: '#d0d6e0' }}>{error}</p>
          </div>
        </div>
      )}

      {/* ── Overdue returns alert ─────────────────────────────────────────── */}
      {kpi.overdueReturns > 0 && (
        <div style={{
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'space-between',
          gap:             16,
          backgroundColor: 'rgba(248,81,73,0.08)',
          border:          '1px solid rgba(248,81,73,0.25)',
          borderRadius:    12,
          padding:         '16px 20px',
          marginBottom:    32,
          flexWrap:        'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              display:         'flex',
              alignItems:      'center',
              justifyContent:  'center',
              width:           36,
              height:          36,
              borderRadius:    8,
              backgroundColor: 'rgba(248,81,73,0.16)',
              flexShrink:      0,
            }}>
              <AlertTriangle size={16} color="#f85149" />
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: 14, color: '#f7f8f8', margin: 0 }}>
                Overdue Asset Returns Detected
              </p>
              <p style={{ fontSize: 13, color: '#d0d6e0', marginTop: 2 }}>
                {kpi.overdueReturns} allocation{kpi.overdueReturns !== 1 ? 's' : ''} past expected return date.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/audits')}
            className="btn-danger"
            style={{ flexShrink: 0 }}
          >
            Review Audit
          </button>
        </div>
      )}

      {/* ── KPI Grid — 4-up on wide, 2-up tablet, 1-up mobile ────────────── */}
      <div style={{
        display:             'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap:                 20,
        marginBottom:        32,
      }}>
        <KpiCard
          title="Assets Available"
          value={kpi.assetsAvailable}
          icon={<Monitor size={16} />}
          delta={kpi.assetsAvailable > 0 ? 'Ready for allocation' : undefined}
        />
        <KpiCard
          title="Assets Allocated"
          value={kpi.assetsAllocated}
          icon={<Key size={16} />}
        />
        <KpiCard
          title="Active Bookings"
          value={kpi.activeBookings}
          icon={<Calendar size={16} />}
        />
        <KpiCard
          title="Maintenance Today"
          value={kpi.maintenanceToday}
          icon={<Wrench size={16} />}
          delta={kpi.maintenanceToday > 0 ? 'Pending attention' : undefined}
          deltaDir={kpi.maintenanceToday > 0 ? 'down' : null}
        />
        <KpiCard
          title="Upcoming Returns"
          value={kpi.upcomingReturns}
          icon={<RefreshCw size={16} />}
          delta="Next 7 days"
        />
        <KpiCard
          title="Pending Transfers"
          value={kpi.pendingTransfers}
          icon={<ArrowLeftRight size={16} />}
        />
      </div>

      {/* ── Activity + Quick Actions ──────────────────────────────────────── */}
      <div style={{
        display:             'grid',
        gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
        gap:                 24,
      }}
        className="af-dashboard-grid"
      >
        {/* Recent Activity */}
        <div>
          <RecentActivityPanel logs={logs} />
        </div>

        {/* Quick Action Center */}
        <div>
          <div className="feature-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <ClipboardCheck size={16} color="#8a8f98" />
              <h2 className="type-card-title" style={{ margin: 0, color: '#f7f8f8' }}>
                Quick Actions
              </h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

              {[
                { icon: ClipboardCheck, label: 'Manage Audit Cycles', sub: 'Launch audits & verify items', path: '/audits', iconColor: '#d29922' },
                { icon: FileBarChart2,  label: 'Reports & Analytics',  sub: 'Export CSVs & track heatmaps',  path: '/reports', iconColor: '#5e6ad2' },
                { icon: Bell,           label: 'System Notifications', sub: 'Check inbox warnings',           path: '/notifications', iconColor: '#58a6ff' },
              ].map(({ icon: Icon, label, sub, path, iconColor }) => (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  style={{
                    display:         'flex',
                    alignItems:      'center',
                    gap:             12,
                    width:           '100%',
                    padding:         '10px 12px',
                    borderRadius:    8,
                    border:          '1px solid #23252a',
                    backgroundColor: 'transparent',
                    cursor:          'pointer',
                    textAlign:       'left',
                    transition:      'background-color var(--duration-fast) var(--ease-standard)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#141516'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Icon size={16} color={iconColor} style={{ flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: '#f7f8f8', margin: 0 }}>{label}</p>
                    <p style={{ fontSize: 12, color: '#8a8f98', margin: '2px 0 0' }}>{sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Responsive: stack columns on mobile */}
      <style>{`
        @media (max-width: 768px) {
          .af-dashboard-grid { grid-template-columns: 1fr !important; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
