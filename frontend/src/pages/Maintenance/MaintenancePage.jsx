// ============================================================================
// MaintenancePage.jsx — Member 3: Screen 7 — Maintenance Management (Kanban)
// WORKFLOW.md: Section 7 — Maintenance Management Workflow
// API Contract: Module 3 / Maintenance
// Features:
//   - 5-column Kanban board (Pending | Approved | Technician Assigned | In Progress | Resolved)
//   - Raise Request modal (asset, description, priority, photo URL)
//   - Approve / Reject actions on Pending cards
//   - Assign Technician modal
//   - Start Work action
//   - Resolve modal (resolvedNotes)
//   - Priority badges: CRITICAL=red, HIGH=orange, MEDIUM=yellow, LOW=gray
// NOTE: No drag-and-drop (per TECH_STACK_FREEZE.md) — button-click actions only
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import {
  Wrench, Plus, X, CheckCircle, XCircle, User, Play, Check,
  AlertTriangle, RefreshCw, ChevronRight,
} from 'lucide-react';
import {
  getMaintenanceRequests,
  createMaintenanceRequest,
  approveRequest,
  rejectRequest,
  assignTechnician,
  startWork,
  resolveRequest,
  getAssets,
  getUsers,
} from '../../api/maintenanceApi.js';

// ─────────────────────────────────────────────────────────────────────────────
// Constants — all values from SHARED_ENUMS.md
// ─────────────────────────────────────────────────────────────────────────────

const KANBAN_COLUMNS = [
  { key: 'PENDING_APPROVAL',   label: 'Pending',             color: 'border-yellow-400', badge: 'bg-yellow-50 text-yellow-800' },
  { key: 'APPROVED',           label: 'Approved',            color: 'border-blue-400',   badge: 'bg-blue-50 text-blue-800' },
  { key: 'TECHNICIAN_ASSIGNED',label: 'Technician Assigned', color: 'border-purple-400', badge: 'bg-purple-50 text-purple-800' },
  { key: 'IN_PROGRESS',        label: 'In Progress',         color: 'border-orange-400', badge: 'bg-orange-50 text-orange-800' },
  { key: 'RESOLVED',           label: 'Resolved',            color: 'border-green-400',  badge: 'bg-green-50 text-green-800' },
];

const PRIORITY_STYLES = {
  CRITICAL: { text: 'CRITICAL', cls: 'bg-red-100 text-red-800 border-red-200' },
  HIGH:     { text: 'HIGH',     cls: 'bg-orange-100 text-orange-800 border-orange-200' },
  MEDIUM:   { text: 'MEDIUM',   cls: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  LOW:      { text: 'LOW',      cls: 'bg-gray-100 text-gray-700 border-gray-200' },
};

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

// ─────────────────────────────────────────────────────────────────────────────
// Modals
// ─────────────────────────────────────────────────────────────────────────────

/** Raise New Maintenance Request Modal */
function RaiseRequestModal({ onClose, onSuccess, assets }) {
  const [assetId, setAssetId]           = useState(assets[0]?.id ?? '');
  const [issueDescription, setIssue]   = useState('');
  const [priority, setPriority]         = useState('MEDIUM');
  const [photoUrl, setPhotoUrl]         = useState('');
  const [submitting, setSubmitting]     = useState(false);
  const [error, setError]               = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!assetId || !issueDescription) return;
    setSubmitting(true);
    setError('');
    try {
      await createMaintenanceRequest({ assetId, issueDescription, priority, photoUrl: photoUrl || null });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error?.message ?? 'Failed to raise request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose} title="Raise Maintenance Request" icon={<Wrench size={18} />}>
      <form onSubmit={handleSubmit} className="space-y-4" id="raise-request-form">
        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>
        )}

        {/* Asset */}
        <div>
          <label htmlFor="maint-asset" className="block text-sm font-medium text-gray-700 mb-1">Asset</label>
          <select
            id="maint-asset"
            value={assetId}
            onChange={(e) => setAssetId(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {assets.map((a) => (
              <option key={a.id} value={a.id}>{a.assetTag} — {a.name}</option>
            ))}
          </select>
        </div>

        {/* Issue Description */}
        <div>
          <label htmlFor="maint-issue" className="block text-sm font-medium text-gray-700 mb-1">Issue Description</label>
          <textarea
            id="maint-issue"
            value={issueDescription}
            onChange={(e) => setIssue(e.target.value)}
            required
            rows={3}
            placeholder="Describe the issue clearly…"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
          />
        </div>

        {/* Priority */}
        <div>
          <label htmlFor="maint-priority" className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            id="maint-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Photo URL (per ACCEPTANCE_CRITERIA.md: no actual file upload needed) */}
        <div>
          <label htmlFor="maint-photo" className="block text-sm font-medium text-gray-700 mb-1">
            Photo URL <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            id="maint-photo"
            type="text"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            placeholder="https://…"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 text-sm hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white rounded-lg py-2 text-sm font-medium transition-colors"
          >
            {submitting ? 'Submitting…' : 'Raise Request'}
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
}

/** Assign Technician Modal */
function AssignTechnicianModal({ request, users, onClose, onSuccess }) {
  const [technicianId, setTechnicianId] = useState(users[0]?.id ?? '');
  const [submitting, setSubmitting]     = useState(false);
  const [error, setError]               = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!technicianId) return;
    setSubmitting(true);
    setError('');
    try {
      await assignTechnician(request.id, technicianId);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error?.message ?? 'Failed to assign technician.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose} title="Assign Technician" icon={<User size={18} />}>
      <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
        <strong>{request.asset?.assetTag}</strong> — {request.asset?.name}
        <br />
        <span className="text-gray-500">{request.issueDescription}</span>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4" id="assign-tech-form">
        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>
        )}
        <div>
          <label htmlFor="technician-select" className="block text-sm font-medium text-gray-700 mb-1">Technician</label>
          <select
            id="technician-select"
            value={technicianId}
            onChange={(e) => setTechnicianId(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 text-sm hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={submitting} className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white rounded-lg py-2 text-sm font-medium">
            {submitting ? 'Assigning…' : 'Assign'}
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
}

/** Resolve Maintenance Modal */
function ResolveModal({ request, onClose, onSuccess }) {
  const [resolvedNotes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resolvedNotes.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await resolveRequest(request.id, resolvedNotes);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error?.message ?? 'Failed to resolve.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose} title="Resolve Maintenance Request" icon={<Check size={18} />}>
      <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
        <strong>{request.asset?.assetTag}</strong> — {request.asset?.name}
        <br />
        <span className="text-gray-500">{request.issueDescription}</span>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4" id="resolve-form">
        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>
        )}
        <div>
          <label htmlFor="resolve-notes" className="block text-sm font-medium text-gray-700 mb-1">Resolution Notes</label>
          <textarea
            id="resolve-notes"
            value={resolvedNotes}
            onChange={(e) => setNotes(e.target.value)}
            required
            rows={3}
            placeholder="Describe what was fixed…"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          />
        </div>
        <p className="text-xs text-gray-400">Resolving will set asset status back to <strong>AVAILABLE</strong>.</p>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 text-sm hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={submitting} className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white rounded-lg py-2 text-sm font-medium">
            {submitting ? 'Resolving…' : 'Mark Resolved'}
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
}

/** Reject Confirmation Modal */
function RejectModal({ request, onClose, onSuccess }) {
  const [reason, setReason]         = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await rejectRequest(request.id, reason);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error?.message ?? 'Failed to reject.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose} title="Reject Request" icon={<XCircle size={18} className="text-red-500" />}>
      <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
        <strong>{request.asset?.assetTag}</strong> — {request.issueDescription}
      </div>
      <form onSubmit={handleSubmit} className="space-y-4" id="reject-form">
        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>
        )}
        <div>
          <label htmlFor="reject-reason" className="block text-sm font-medium text-gray-700 mb-1">
            Reason <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            id="reject-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            placeholder="Reason for rejection…"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 text-sm hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={submitting} className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white rounded-lg py-2 text-sm font-medium">
            {submitting ? 'Rejecting…' : 'Reject Request'}
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
}

/** Generic Modal overlay wrapper */
function ModalOverlay({ onClose, title, icon, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            {icon}
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Kanban Card
// ─────────────────────────────────────────────────────────────────────────────
function MaintenanceCard({ request, onApprove, onReject, onAssign, onStart, onResolve, actionLoading }) {
  const priority = PRIORITY_STYLES[request.priority] ?? PRIORITY_STYLES.MEDIUM;
  const isLoading = actionLoading === request.id;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3 hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
      {/* Asset + Priority */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-gray-900">
            {request.asset?.assetTag ?? '—'}
          </p>
          <p className="text-xs text-gray-500">{request.asset?.name}</p>
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${priority.cls}`}>
          {priority.text}
        </span>
      </div>

      {/* Issue description */}
      <p className="text-xs text-gray-700 line-clamp-2">{request.issueDescription}</p>

      {/* Requester + Technician */}
      <div className="text-xs text-gray-500 space-y-0.5">
        <p>Raised by: <span className="text-gray-700 font-medium">{request.requestedBy?.name ?? '—'}</span></p>
        {request.technician && (
          <p>Technician: <span className="text-gray-700 font-medium">{request.technician.name}</span></p>
        )}
      </div>

      {/* Action buttons — per status */}
      <div className="pt-1 space-y-2">
        {request.status === 'PENDING_APPROVAL' && (
          <div className="flex gap-2">
            <button
              onClick={() => onApprove(request.id)}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-1 text-xs bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white rounded-lg py-1.5 font-medium transition-colors"
            >
              <CheckCircle size={12} /> Approve
            </button>
            <button
              onClick={() => onReject(request)}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-1 text-xs bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg py-1.5 font-medium transition-colors"
            >
              <XCircle size={12} /> Reject
            </button>
          </div>
        )}

        {request.status === 'APPROVED' && (
          <button
            onClick={() => onAssign(request)}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-1 text-xs bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white rounded-lg py-1.5 font-medium transition-colors"
          >
            <User size={12} /> Assign Technician
          </button>
        )}

        {request.status === 'TECHNICIAN_ASSIGNED' && (
          <button
            onClick={() => onStart(request.id)}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-1 text-xs bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white rounded-lg py-1.5 font-medium transition-colors"
          >
            <Play size={12} /> Start Work
          </button>
        )}

        {request.status === 'IN_PROGRESS' && (
          <button
            onClick={() => onResolve(request)}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-1 text-xs bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white rounded-lg py-1.5 font-medium transition-colors"
          >
            <Check size={12} /> Mark Resolved
          </button>
        )}

        {request.status === 'RESOLVED' && (
          <div className="flex items-center gap-1 text-xs text-green-700 bg-green-50 rounded-lg py-1.5 px-2">
            <CheckCircle size={12} /> Resolved
            {request.resolvedNotes && (
              <span className="text-gray-500 ml-1 truncate">— {request.resolvedNotes}</span>
            )}
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center gap-1 text-xs text-gray-400 py-1">
            <RefreshCw size={12} className="animate-spin" /> Processing…
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Kanban Skeletons
// ─────────────────────────────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1.5 w-full">
          <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
          <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
        </div>
        <div className="h-4 bg-gray-200 rounded-full w-16 animate-pulse flex-shrink-0" />
      </div>
      <div className="space-y-1.5 pt-1">
        <div className="h-3 bg-gray-200 rounded w-full animate-pulse" />
        <div className="h-3 bg-gray-200 rounded w-5/6 animate-pulse" />
      </div>
      <div className="space-y-1 pt-1">
        <div className="h-3 bg-gray-200 rounded w-24 animate-pulse" />
        <div className="h-3 bg-gray-200 rounded w-32 animate-pulse" />
      </div>
      <div className="pt-2">
        <div className="h-7 bg-gray-200 rounded-lg w-full animate-pulse" />
      </div>
    </div>
  );
}

function KanbanSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {KANBAN_COLUMNS.map((col) => (
        <div key={col.key} className={`flex flex-col min-w-[220px] w-full border-t-4 ${col.color} bg-gray-50 rounded-xl`}>
          <div className="px-4 pt-4 pb-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800">{col.label}</h3>
              <div className="h-5 w-6 bg-gray-200 rounded-full animate-pulse" />
            </div>
          </div>
          <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[calc(100vh-260px)]">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Kanban Column
// ─────────────────────────────────────────────────────────────────────────────
function KanbanColumn({ column, requests, onApprove, onReject, onAssign, onStart, onResolve, actionLoading }) {
  return (
    <div className={`flex flex-col min-w-[220px] w-full border-t-4 ${column.color} bg-gray-50 rounded-xl`}>
      {/* Column header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800">{column.label}</h3>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${column.badge}`}>
            {requests.length}
          </span>
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[calc(100vh-260px)]">
        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-24 text-center text-gray-400 text-xs">
            <ChevronRight size={20} className="mb-1 opacity-30" />
            No requests
          </div>
        ) : (
          requests.map((r) => (
            <MaintenanceCard
              key={r.id}
              request={r}
              onApprove={onApprove}
              onReject={onReject}
              onAssign={onAssign}
              onStart={onStart}
              onResolve={onResolve}
              actionLoading={actionLoading}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function MaintenancePage() {
  const [requests, setRequests]       = useState([]);
  const [assets, setAssets]           = useState([]);
  const [users, setUsers]             = useState([]);
  const [loading, setLoading]         = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // id of request being acted on
  const [globalError, setGlobalError] = useState('');

  // Modal state — only one open at a time
  const [showRaiseModal, setShowRaiseModal]     = useState(false);
  const [assignTarget, setAssignTarget]         = useState(null);  // request object
  const [resolveTarget, setResolveTarget]       = useState(null);  // request object
  const [rejectTarget, setRejectTarget]         = useState(null);  // request object

  // ── Fetch all maintenance requests ────────────────────────────────────────
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setGlobalError('');
    try {
      const res = await getMaintenanceRequests();
      setRequests(res.data ?? []);
    } catch (err) {
      setGlobalError(err.response?.data?.error?.message ?? 'Failed to load maintenance requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch assets + users for modals ──────────────────────────────────────
  useEffect(() => {
    fetchRequests();
    getAssets().then(setAssets);
    getUsers().then(setUsers);
  }, [fetchRequests]);

  // ── Group requests by status for columns ─────────────────────────────────
  const grouped = KANBAN_COLUMNS.reduce((acc, col) => {
    acc[col.key] = requests.filter((r) => r.status === col.key);
    return acc;
  }, {});

  // ── Action handlers ───────────────────────────────────────────────────────
  const handleApprove = async (id) => {
    setActionLoading(id);
    setGlobalError('');
    try {
      await approveRequest(id);
      await fetchRequests();
    } catch (err) {
      setGlobalError(err.response?.data?.error?.message ?? 'Failed to approve request.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStart = async (id) => {
    setActionLoading(id);
    setGlobalError('');
    try {
      await startWork(id);
      await fetchRequests();
    } catch (err) {
      setGlobalError(err.response?.data?.error?.message ?? 'Failed to start work.');
    } finally {
      setActionLoading(null);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-5">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Wrench size={24} className="text-orange-600" />
              Maintenance Management
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Track and manage asset maintenance requests across the organization.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchRequests}
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-orange-600 border border-gray-200 hover:border-orange-300 rounded-lg px-3 py-1.5 transition-colors"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              id="raise-request-btn"
              onClick={() => setShowRaiseModal(true)}
              className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg px-4 py-1.5 transition-colors"
            >
              <Plus size={16} />
              Raise Request
            </button>
          </div>
        </div>

        {/* Global error */}
        {globalError && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            <AlertTriangle size={16} className="flex-shrink-0" />
            {globalError}
          </div>
        )}

        {/* ── Kanban Board ────────────────────────────────────────────────── */}
        {loading && requests.length === 0 ? (
          <KanbanSkeleton />
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {KANBAN_COLUMNS.map((col) => (
              <div key={col.key} className="flex-1 min-w-[220px]">
                <KanbanColumn
                  column={col}
                  requests={grouped[col.key] ?? []}
                  onApprove={handleApprove}
                  onReject={(req) => setRejectTarget(req)}
                  onAssign={(req) => setAssignTarget(req)}
                  onStart={handleStart}
                  onResolve={(req) => setResolveTarget(req)}
                  actionLoading={actionLoading}
                />
              </div>
            ))}
          </div>
        )}

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      {showRaiseModal && (
        <RaiseRequestModal
          assets={assets}
          onClose={() => setShowRaiseModal(false)}
          onSuccess={() => {
            setShowRaiseModal(false);
            fetchRequests();
          }}
        />
      )}

      {assignTarget && (
        <AssignTechnicianModal
          request={assignTarget}
          users={users}
          onClose={() => setAssignTarget(null)}
          onSuccess={() => {
            setAssignTarget(null);
            fetchRequests();
          }}
        />
      )}

      {resolveTarget && (
        <ResolveModal
          request={resolveTarget}
          onClose={() => setResolveTarget(null)}
          onSuccess={() => {
            setResolveTarget(null);
            fetchRequests();
          }}
        />
      )}

      {rejectTarget && (
        <RejectModal
          request={rejectTarget}
          onClose={() => setRejectTarget(null)}
          onSuccess={() => {
            setRejectTarget(null);
            fetchRequests();
          }}
        />
      )}
    </div>
  );
}
