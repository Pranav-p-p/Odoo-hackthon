import React, { useState, useEffect } from 'react';
import {
  FileBarChart2,
  Download,
  AlertTriangle,
  RefreshCw,
  Clock,
  CheckCircle,
  Database,
  BarChart,
  HelpCircle,
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
  const [maintenance, setMaintenance] = useState([]);
  const [idleAssets, setIdleAssets] = useState([]);
  const [mostUsed, setMostUsed] = useState([]);
  const [dueMaintenance, setDueMaintenance] = useState([]);
  const [breakdown, setBreakdown] = useState([]);
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

  const getHeatmapColor = (count) => {
    if (count === 0) return 'bg-gray-100';
    if (count < 3) return 'bg-indigo-100 text-indigo-800';
    if (count < 6) return 'bg-indigo-300 text-indigo-900';
    return 'bg-indigo-500 text-white font-bold';
  };

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-10 w-10 animate-spin text-indigo-600" />
          <p className="text-sm font-medium text-gray-500">Compiling analytics dashboards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <FileBarChart2 className="h-8 w-8 text-indigo-600" />
            Reports & Analytics
          </h1>
          <p className="mt-1 text-sm text-gray-500 font-medium">
            Export system data and visualize resource allocation patterns.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Data
        </button>
      </div>

      {/* CSV Export Quick Action Cards */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">
          Export Raw Data Logs (CSV)
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { type: 'utilization', label: 'Utilization Stats' },
            { type: 'maintenance', label: 'Maintenance Log' },
            { type: 'allocation', label: 'Allocation History' },
            { type: 'booking', label: 'Shared Bookings' },
          ].map((item) => (
            <button
              key={item.type}
              onClick={() => handleExport(item.type)}
              disabled={downloading}
              className="flex items-center justify-between rounded-xl border border-gray-150 p-4 hover:bg-indigo-50/10 hover:border-indigo-200 transition-all duration-200 cursor-pointer"
            >
              <span className="text-sm font-bold text-gray-900">{item.label}</span>
              <Download className="h-4.5 w-4.5 text-indigo-600" />
            </button>
          ))}
        </div>
      </div>

      {/* Main Reports Grid Layout */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Utilization by Department progress bars */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <BarChart className="h-5 w-5 text-gray-500" />
            Department Utilization Rates
          </h2>
          <div className="space-y-4 pt-2">
            {utilization.map((item) => (
              <div key={item.departmentId} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-gray-700">
                  <span>{item.departmentName}</span>
                  <span>{item.utilizationRate}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${item.utilizationRate}%` }}
                  />
                </div>
                <div className="text-[10px] text-gray-400">
                  {item.allocatedAssets} / {item.totalAssets} Assets Assigned
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Used Assets */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-gray-500" />
            Top 5 High-Demand Assets
          </h2>
          <div className="pt-2">
            <div className="overflow-hidden border border-gray-100 rounded-xl">
              <table className="min-w-full divide-y divide-gray-250 text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Tag</th>
                    <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Usage Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {mostUsed.slice(0, 5).map((asset) => (
                    <tr key={asset.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 text-xs font-bold text-gray-900">{asset.assetTag}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 font-medium">{asset.name}</td>
                      <td className="px-4 py-3 text-xs text-gray-900 font-semibold">
                        {asset.totalUsage} times (Alloc: {asset.allocationCount}, Book: {asset.bookingCount})
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Idle Assets (30+ Days AVAILABLE) */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-500" />
            Idle Assets (30+ Days Available)
          </h2>
          <div className="pt-2 max-h-72 overflow-y-auto divide-y divide-gray-50">
            {idleAssets.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">No idle assets flagged.</p>
            ) : (
              idleAssets.map((asset) => (
                <div key={asset.id} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <h4 className="font-bold text-gray-900">{asset.name}</h4>
                    <p className="text-gray-400 mt-0.5">{asset.assetTag} — {asset.location}</p>
                  </div>
                  <span className="text-amber-600 bg-amber-50 rounded-xl px-2.5 py-1 font-semibold ring-1 ring-inset ring-amber-600/10">
                    Idle since {new Date(asset.idleSince).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Due For Maintenance */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-gray-500" />
            Assets Requiring Proactive Maintenance
          </h2>
          <div className="pt-2 max-h-72 overflow-y-auto divide-y divide-gray-50">
            {dueMaintenance.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">All assets are in good condition.</p>
            ) : (
              dueMaintenance.map((asset) => (
                <div key={asset.id} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <h4 className="font-bold text-gray-900">{asset.name}</h4>
                    <p className="text-gray-400 mt-0.5">{asset.assetTag} — {asset.location}</p>
                  </div>
                  <span className="text-red-600 bg-red-50 rounded-xl px-2.5 py-1 font-semibold ring-1 ring-inset ring-red-600/10">
                    Condition: {asset.condition} ({asset.status})
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Booking Heatmap (7x24 matrix) */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Clock className="h-5 w-5 text-gray-500" />
          Resource Booking Heatmap (Hour of Day vs Day of Week)
        </h2>
        <div className="overflow-x-auto pt-2">
          <div className="inline-block min-w-full align-middle">
            <div className="grid grid-cols-[auto_repeat(24,_minmax(32px,_1fr))] gap-1.5 min-w-[800px] text-center text-xs">
              {/* Hour Labels */}
              <div />
              {Array.from({ length: 24 }).map((_, hour) => (
                <div key={hour} className="font-semibold text-gray-400 text-[10px]">
                  {hour}h
                </div>
              ))}

              {/* Day Rows */}
              {heatmap.map((row, dayIdx) => (
                <React.Fragment key={dayIdx}>
                  <div className="font-semibold text-gray-700 pr-3 text-left w-12 flex items-center">
                    {daysOfWeek[dayIdx]}
                  </div>
                  {row.map((count, hourIdx) => (
                    <div
                      key={hourIdx}
                      className={`h-8 rounded-lg flex items-center justify-center transition-all ${getHeatmapColor(count)}`}
                      title={`${daysOfWeek[dayIdx]} at ${hourIdx}:00 — ${count} bookings`}
                    >
                      {count > 0 && <span className="text-[10px]">{count}</span>}
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-4 items-center text-xs text-gray-400 mt-2 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3.5 w-3.5 rounded bg-gray-100" /> 0 bookings
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3.5 w-3.5 rounded bg-indigo-155" style={{ backgroundColor: 'rgb(224, 231, 255)' }} /> 1-2 bookings
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3.5 w-3.5 rounded bg-indigo-350" style={{ backgroundColor: 'rgb(199, 210, 254)' }} /> 3-5 bookings
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3.5 w-3.5 rounded bg-indigo-500" /> 6+ bookings
          </span>
        </div>
      </div>
    </div>
  );
}
