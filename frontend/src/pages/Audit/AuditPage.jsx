import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  PlusCircle,
  AlertTriangle,
  RefreshCw,
  FolderOpen,
  Calendar,
  User,
  ArrowRight,
  Filter,
  CheckCircle,
} from 'lucide-react';
import {
  getAudits,
  createAudit,
  getAuditById,
  verifyItem,
  getDiscrepancyReport,
  closeAudit,
} from '../../api/audit.api';
import apiClient from '../../api/authApi';
import AuditItemRow from '../../components/audit/AuditItemRow';

export default function AuditPage() {
  const [cycles, setCycles] = useState([]);
  const [selectedCycle, setSelectedCycle] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterDiscrepancies, setFilterDiscrepancies] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    departmentId: '',
    locationScope: '',
    auditorId: '',
    startDate: '',
    endDate: '',
  });
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [formError, setFormError] = useState('');

  // Fetch cycles list
  const fetchCycles = async () => {
    try {
      setLoading(true);
      const res = await getAudits();
      if (res.success) {
        setCycles(res.data);
      }
    } catch (err) {
      console.error('[AuditPage] Error listing cycles:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch options for creation form
  const fetchFormOptions = async () => {
    try {
      const [deptRes, userRes] = await Promise.all([
        apiClient.get('/departments'),
        apiClient.get('/users'),
      ]);
      if (deptRes.data.success) setDepartments(deptRes.data.data);
      if (userRes.data.success) setUsers(userRes.data.data);
    } catch (err) {
      console.error('[AuditPage] Error loading selectors:', err);
    }
  };

  useEffect(() => {
    fetchCycles();
    fetchFormOptions();
  }, []);

  // Fetch detailed checklist of selected cycle
  const handleSelectCycle = async (cycleId) => {
    try {
      const res = await getAuditById(cycleId);
      if (res.success) {
        setSelectedCycle(res.data);
        setChecklist(res.data.items);
      }
    } catch (err) {
      console.error('[AuditPage] Error fetching cycle checklist:', err);
    }
  };

  // Toggle discrepancy filter
  const handleToggleDiscrepancies = async () => {
    if (!selectedCycle) return;

    if (!filterDiscrepancies) {
      try {
        const res = await getDiscrepancyReport(selectedCycle.id);
        if (res.success) {
          setChecklist(res.data);
          setFilterDiscrepancies(true);
        }
      } catch (err) {
        console.error('[AuditPage] Error fetching discrepancy report:', err);
      }
    } else {
      // Reload full list
      handleSelectCycle(selectedCycle.id);
      setFilterDiscrepancies(false);
    }
  };

  // Handle single item update
  const handleUpdateItem = async (itemId, body) => {
    if (!selectedCycle) return;
    try {
      const res = await verifyItem(selectedCycle.id, itemId, body);
      if (res.success) {
        // Refresh detailed checklist
        if (filterDiscrepancies) {
          const discRes = await getDiscrepancyReport(selectedCycle.id);
          if (discRes.success) setChecklist(discRes.data);
        } else {
          setChecklist((prev) =>
            prev.map((item) => (item.id === itemId ? { ...item, ...res.data } : item))
          );
        }
      }
    } catch (err) {
      console.error('[AuditPage] Error updating audit item:', err);
    }
  };

  // Close audit cycle
  const handleCloseCycle = async () => {
    if (!selectedCycle) return;
    if (!window.confirm('Are you sure you want to CLOSE this audit cycle? This will lock item statuses and flag missing assets as LOST in the system.')) {
      return;
    }

    try {
      const res = await closeAudit(selectedCycle.id);
      if (res.success) {
        setSelectedCycle(res.data);
        setChecklist(res.data.items);
        setFilterDiscrepancies(false);
        fetchCycles(); // Refresh cycles table
      }
    } catch (err) {
      console.error('[AuditPage] Error closing audit cycle:', err);
    }
  };

  // Submit new cycle
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name || !formData.auditorId || !formData.startDate || !formData.endDate) {
      setFormError('Please fill in all required fields.');
      return;
    }

    try {
      const res = await createAudit(formData);
      if (res.success) {
        setShowCreateModal(false);
        setFormData({
          name: '',
          departmentId: '',
          locationScope: '',
          auditorId: '',
          startDate: '',
          endDate: '',
        });
        fetchCycles();
      }
    } catch (err) {
      console.error('[AuditPage] Error creating cycle:', err);
      setFormError(err.response?.data?.error?.message || 'Failed to create audit cycle.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OPEN':
        return (
          <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10">
            Open
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-700/10 animate-pulse">
            In Progress
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-700/10">
            Closed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <ClipboardCheck className="h-8 w-8 text-indigo-600" />
            Audit Cycles
          </h1>
          <p className="mt-1 text-sm text-gray-500 font-medium">
            Schedule physical audits, verify assets, and compile discrepancy logs.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
        >
          <PlusCircle className="h-4.5 w-4.5" />
          New Audit Cycle
        </button>
      </div>

      {/* Main Split Layout */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Side: Audit Cycles List */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-gray-50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-gray-500" />
                Active Cycles
              </h2>
              <button
                onClick={fetchCycles}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-6 w-6 animate-spin text-gray-300" />
              </div>
            ) : cycles.length === 0 ? (
              <div className="py-12 text-center text-sm text-gray-400">
                No audit cycles registered yet.
              </div>
            ) : (
              <div className="mt-4 divide-y divide-gray-50">
                {cycles.map((cycle) => (
                  <button
                    key={cycle.id}
                    onClick={() => handleSelectCycle(cycle.id)}
                    className={`w-full py-4 text-left flex items-start justify-between group transition-all duration-200 border-l-4 pl-3 ${
                      selectedCycle?.id === cycle.id
                        ? 'border-indigo-600 bg-indigo-50/10'
                        : 'border-transparent hover:bg-gray-50/50'
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-gray-900 group-hover:text-indigo-600">
                        {cycle.name}
                      </h4>
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {cycle.auditor.name}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(cycle.startDate).toLocaleDateString()} -{' '}
                        {new Date(cycle.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>{getStatusBadge(cycle.status)}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Verification Checklist Details */}
        <div className="lg:col-span-2">
          {!selectedCycle ? (
            <div className="flex flex-col items-center justify-center py-32 bg-white border border-gray-100 rounded-2xl shadow-sm text-center">
              <ClipboardCheck className="h-16 w-16 text-gray-200" />
              <h3 className="mt-4 text-lg font-bold text-gray-900">No Cycle Selected</h3>
              <p className="mt-1 text-sm text-gray-400">
                Select an audit cycle from the panel on the left to verify items.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-6">
              {/* Cycle Detail Header */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-gray-150">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-gray-900">{selectedCycle.name}</h2>
                    {getStatusBadge(selectedCycle.status)}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 font-medium">
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" /> Auditor: {selectedCycle.auditor.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" /> Deadline:{' '}
                      {new Date(selectedCycle.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {selectedCycle.status !== 'CLOSED' && (
                  <button
                    onClick={handleCloseCycle}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition-colors"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Close Audit Cycle
                  </button>
                )}
              </div>

              {/* Checklist Action Filters */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900">
                  Verification Checklist ({checklist.length} items)
                </h3>
                <button
                  onClick={handleToggleDiscrepancies}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    filterDiscrepancies
                      ? 'bg-amber-50 border-amber-200 text-amber-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Filter className="h-3.5 w-3.5" />
                  {filterDiscrepancies ? 'Show Full Checklist' : 'Show Discrepancies Only'}
                </button>
              </div>

              {/* Checklist Table */}
              <div className="overflow-x-auto border border-gray-100 rounded-xl shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3.5 text-xs font-bold uppercase text-gray-500 tracking-wider">
                        Asset Tag
                      </th>
                      <th className="px-6 py-3.5 text-xs font-bold uppercase text-gray-500 tracking-wider">
                        Asset Name
                      </th>
                      <th className="px-6 py-3.5 text-xs font-bold uppercase text-gray-500 tracking-wider">
                        Expected Location
                      </th>
                      <th className="px-6 py-3.5 text-xs font-bold uppercase text-gray-500 tracking-wider">
                        Snapshot Status
                      </th>
                      <th className="px-6 py-3.5 text-xs font-bold uppercase text-gray-500 tracking-wider">
                        Actual Status
                      </th>
                      <th className="px-6 py-3.5 text-xs font-bold uppercase text-gray-500 tracking-wider">
                        Notes
                      </th>
                      {selectedCycle.status !== 'CLOSED' && <th className="relative px-6 py-3.5" />}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {checklist.map((item) => (
                      <AuditItemRow
                        key={item.id}
                        item={item}
                        isClosed={selectedCycle.status === 'CLOSED'}
                        onSave={handleUpdateItem}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Cycle Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-550/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-gray-100 bg-white p-6 shadow-xl space-y-6">
            <h3 className="text-xl font-bold text-gray-900">Initiate Audit Cycle</h3>

            {formError && (
              <div className="rounded-xl bg-red-50 border border-red-100 p-3 text-xs text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                  Audit Cycle Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q3 2026 Bengaluru HQ Audit"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                    Auditor *
                  </label>
                  <select
                    required
                    value={formData.auditorId}
                    onChange={(e) => setFormData({ ...formData, auditorId: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="">Select Auditor...</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                    Department Scope
                  </label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) =>
                      setFormData({ ...formData, departmentId: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="">All Departments</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                  Location Scope Scope (e.g. "Bengaluru")
                </label>
                <input
                  type="text"
                  placeholder="e.g. Floor 2"
                  value={formData.locationScope}
                  onChange={(e) => setFormData({ ...formData, locationScope: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  Create Cycle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
