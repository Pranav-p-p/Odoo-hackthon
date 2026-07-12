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
  PlusCircle,
  FileBarChart2,
  Bell,
  RefreshCw,
} from 'lucide-react';
import { getKpi, getRecentActivity } from '../../api/dashboard.api';
import KpiCard from '../../components/dashboard/KpiCard';
import RecentActivityPanel from '../../components/dashboard/RecentActivityPanel';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [kpi, setKpi] = useState({
    assetsAvailable: 0,
    assetsAllocated: 0,
    maintenanceToday: 0,
    upcomingReturns: 0,
    pendingTransfers: 0,
    activeBookings: 0,
    overdueReturns: 0,
  });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [kpiRes, logsRes] = await Promise.all([getKpi(), getRecentActivity()]);

      if (kpiRes.success) setKpi(kpiRes.data);
      if (logsRes.success) setLogs(logsRes.data);
    } catch (err) {
      console.error('[Dashboard] Error fetching dashboard data:', err);
      setError('Could not connect to the server. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-10 w-10 animate-spin text-indigo-600" />
          <p className="text-sm font-medium text-gray-500">Loading dashboard intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-8">
      {/* Top Banner Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Real-time tracking of organization assets and resource activities.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Stats
        </button>
      </div>

      {error && (
        <div className="mb-8 rounded-xl border border-red-100 bg-red-50 p-4 text-red-700 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold">Backend Connection Issue</h4>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Conditionally Rendered Overdue Return Alert */}
      {kpi.overdueReturns > 0 && (
        <div className="mb-8 flex items-center justify-between rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-orange-50 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-red-100 p-3 text-red-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-950">Overdue Asset Returns Detected</h3>
              <p className="text-sm text-red-800 mt-1">
                There are currently <span className="font-bold">{kpi.overdueReturns}</span> asset allocations that have passed their expected return date.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/audit')}
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition-colors"
          >
            Review Audit Discrepancies
          </button>
        </div>
      )}

      {/* Grid of 6 KPI Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard
          title="Assets Available"
          value={kpi.assetsAvailable}
          icon={<Monitor className="h-6 w-6" />}
          colorClass="text-emerald-600"
          bgGradient="from-emerald-50 to-teal-50"
        />
        <KpiCard
          title="Assets Allocated"
          value={kpi.assetsAllocated}
          icon={<Key className="h-6 w-6" />}
          colorClass="text-indigo-600"
          bgGradient="from-indigo-50 to-blue-50"
        />
        <KpiCard
          title="Active Bookings"
          value={kpi.activeBookings}
          icon={<Calendar className="h-6 w-6" />}
          colorClass="text-pink-600"
          bgGradient="from-pink-50 to-rose-50"
        />
        <KpiCard
          title="Maintenance Requests Today"
          value={kpi.maintenanceToday}
          icon={<Wrench className="h-6 w-6" />}
          colorClass="text-amber-600"
          bgGradient="from-amber-50 to-yellow-50"
        />
        <KpiCard
          title="Upcoming Returns (7 Days)"
          value={kpi.upcomingReturns}
          icon={<RefreshCw className="h-6 w-6" />}
          colorClass="text-blue-600"
          bgGradient="from-blue-50 to-cyan-50"
        />
        <KpiCard
          title="Pending Transfer Requests"
          value={kpi.pendingTransfers}
          icon={<ArrowLeftRight className="h-6 w-6" />}
          colorClass="text-purple-600"
          bgGradient="from-purple-50 to-violet-50"
        />
      </div>

      {/* Quick Actions & Recent Activity Sections */}
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Left Columns: Activity Log */}
        <div className="lg:col-span-2">
          <RecentActivityPanel logs={logs} />
        </div>

        {/* Right Column: Quick Action Center */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-gray-500" />
              Quick Action Center
            </h2>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate('/audit')}
                className="flex items-center gap-3 w-full rounded-xl border border-gray-150 p-3 text-left hover:bg-gray-50 transition-colors"
              >
                <ClipboardCheck className="h-5 w-5 text-amber-500" />
                <div>
                  <div className="text-sm font-semibold text-gray-900">Manage Audit Cycles</div>
                  <div className="text-xs text-gray-400">Launch audits & verify items</div>
                </div>
              </button>
              <button
                onClick={() => navigate('/reports')}
                className="flex items-center gap-3 w-full rounded-xl border border-gray-150 p-3 text-left hover:bg-gray-50 transition-colors"
              >
                <FileBarChart2 className="h-5 w-5 text-indigo-500" />
                <div>
                  <div className="text-sm font-semibold text-gray-900">Reports & Analytics</div>
                  <div className="text-xs text-gray-400">Export CSVs & track heatmaps</div>
                </div>
              </button>
              <button
                onClick={() => navigate('/notifications')}
                className="flex items-center gap-3 w-full rounded-xl border border-gray-150 p-3 text-left hover:bg-gray-50 transition-colors"
              >
                <Bell className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="text-sm font-semibold text-gray-900">System Notifications</div>
                  <div className="text-xs text-gray-400">Check inbox warnings</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
