import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftRight, User, Building2, Calendar, CheckCircle2,
  XCircle, AlertTriangle, Loader2, RotateCcw,
  AlertCircle, Clock, CheckCheck, Ban, RefreshCw, Send,
  ClipboardList, Layers,
} from 'lucide-react';
import {
  getAllocations, createAllocation, returnAllocation,
  getTransfers, createTransfer, approveTransfer, rejectTransfer,
  getAssets, getUsers, getDepartments,
} from './allocationApi';
import StatusBadge from '../Assets/components/StatusBadge';
import ConflictBanner from '../Assets/components/ConflictBanner';
import AssetSelector from '../Assets/components/AssetSelector';
import RoleGate from '../Assets/components/RoleGate';
import useAuth from '../../hooks/useAuth';

// ─── Role helpers ──────────────────────────────────────────────────────────────

function canManage(user) {
  return user && (user.role === 'ASSET_MANAGER' || user.role === 'ADMIN');
}

// ─── Tiny reusable atoms ───────────────────────────────────────────────────────
function Pill({ label, cls }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}

const TRANSFER_STATUS_STYLES = {
  REQUESTED: 'bg-status-maintenance-bg text-status-maintenance ring-0',
  APPROVED:  'bg-status-allocated-bg text-status-allocated ring-0',
  REJECTED:  'bg-[var(--color-semantic-error-bg)] text-semantic-error ring-0',
  COMPLETED: 'bg-status-available-bg text-status-available ring-0',
};

const ALLOC_STATUS_STYLES = {
  ACTIVE:   'bg-status-allocated-bg text-status-allocated ring-0',
  RETURNED: 'bg-status-available-bg text-status-available ring-0',
  OVERDUE:  'bg-[var(--color-semantic-error-bg)] text-semantic-error ring-0',
};

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function SectionTitle({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon className="h-4 w-4 text-indigo-600 flex-shrink-0" />
      <div>
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        {subtitle && <p className="text-xs text-ink-subtle">{subtitle}</p>}
      </div>
    </div>
  );
}

function SuccessAlert({ message, onDismiss }) {
  return (
    <div className="flex items-start gap-3 bg-status-available-bg border border-status-available text-status-available rounded-lg px-4 py-3 text-sm">
      <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-emerald-600" />
      <span className="flex-1">{message}</span>
      <button onClick={onDismiss} className="text-emerald-500 hover:text-emerald-700">
        <XCircle className="h-4 w-4" />
      </button>
    </div>
  );
}

function ErrorAlert({ message }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-3 bg-[var(--color-semantic-error-bg)] border border-semantic-error text-semantic-error rounded-lg px-4 py-3 text-sm">
      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}


// ─── Return Form (inline modal) ────────────────────────────────────────────────
function ReturnForm({ allocation, onCancel, onSuccess }) {
  const [returnCondition, setReturnCondition] = useState('Good');
  const [returnNotes, setReturnNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await returnAllocation(allocation.id, { returnCondition, returnNotes });
      onSuccess(`Asset "${allocation.asset?.name ?? allocation.assetId}" marked as returned.`);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to process return. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border border-hairline rounded-lg p-4 bg-slate-50 space-y-3">
      <p className="field-label">Return Asset</p>
      {error && <ErrorAlert message={error} />}
      <div>
        <label className="field-label">Return Condition <span className="text-red-500">*</span></label>
        <select
          value={returnCondition}
          onChange={e => setReturnCondition(e.target.value)}
          className="input-field"
        >
          <option value="Good">Good</option>
          <option value="Fair">Fair</option>
          <option value="Damaged">Damaged</option>
        </select>
      </div>
      <div>
        <label className="field-label">Notes <span className="text-ink-tertiary">(optional)</span></label>
        <textarea
          value={returnNotes}
          onChange={e => setReturnNotes(e.target.value)}
          rows={2}
          placeholder="Any notes about the returned condition…"
          className="input-field"
        />
      </div>
      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-1.5 btn-primary text-sm font-medium px-4 py-2 rounded-md transition-colors"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCheck className="h-3.5 w-3.5" />}
          Confirm Return
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-ink-tertiary hover:text-ink px-3 py-2 rounded-md border border-hairline hover:border-hairline transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ─── Active Allocations list ───────────────────────────────────────────────────
function ActiveAllocationsList({ allocations, loading, onReturnSuccess }) {
  const [returningId, setReturningId] = useState(null);

  if (loading) {
    return (
      <div className="py-8 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
        <p className="text-sm text-ink-subtle">Loading active allocations…</p>
      </div>
    );
  }

  if (!allocations.length) {
    return (
      <div className="py-8 text-center">
        <Layers className="h-7 w-7 text-slate-200 mx-auto mb-2" />
        <p className="text-sm text-ink-subtle">No active allocations at the moment.</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-[#23252a]">
      {allocations.map(a => (
        <li key={a.id} className="py-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-ink">
                  {a.asset?.name ?? a.assetId}
                </span>
                {a.asset?.assetTag && (
                  <span className="font-mono text-xs text-ink-tertiary bg-slate-100 px-1.5 py-0.5 rounded">
                    {a.asset.assetTag}
                  </span>
                )}
                <Pill label={a.status} cls={ALLOC_STATUS_STYLES[a.status] ?? 'bg-slate-100 text-ink-subtle ring-1 ring-slate-200'} />
              </div>
              <div className="mt-1 text-xs text-ink-subtle flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {a.user?.name ?? 'Unknown'}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Since {formatDate(a.allocatedAt)}
                </span>
                {a.expectedReturn && (
                  <span className={`flex items-center gap-1 ${a.status === 'OVERDUE' ? 'text-red-600 font-medium' : ''}`}>
                    <Clock className="h-3 w-3" />
                    Due {formatDate(a.expectedReturn)}
                  </span>
                )}
              </div>
            </div>
            {a.status === 'ACTIVE' && returningId !== a.id && (
              <button
                onClick={() => setReturningId(a.id)}
                className="flex items-center gap-1.5 text-xs font-medium btn-tertiary px-3 py-1.5 rounded-md transition-colors flex-shrink-0"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Mark Returned
              </button>
            )}
          </div>

          {returningId === a.id && (
            <div className="mt-3">
              <ReturnForm
                allocation={a}
                onCancel={() => setReturningId(null)}
                onSuccess={(msg) => {
                  setReturningId(null);
                  onReturnSuccess(msg);
                }}
              />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

// ─── Pending Transfers list ────────────────────────────────────────────────────
function PendingTransfersList({ transfers, departments = [], loading, onAction }) {
  const [actionStates, setActionStates] = useState({});
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  async function handleApprove(id) {
    setActionStates(s => ({ ...s, [id]: 'approving' }));
    try {
      await approveTransfer(id);
      onAction(`Transfer approved successfully.`);
    } catch (err) {
      setActionStates(s => ({ ...s, [id]: null }));
      onAction(null, err?.response?.data?.message || 'Failed to approve transfer.');
    }
  }

  async function handleReject(id) {
    if (!rejectReason.trim()) return;
    setActionStates(s => ({ ...s, [id]: 'rejecting' }));
    try {
      await rejectTransfer(id, { reason: rejectReason });
      setRejectingId(null);
      setRejectReason('');
      onAction('Transfer rejected.');
    } catch (err) {
      setActionStates(s => ({ ...s, [id]: null }));
      onAction(null, err?.response?.data?.message || 'Failed to reject transfer.');
    }
  }

  if (loading) {
    return (
      <div className="py-8 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
        <p className="text-sm text-ink-subtle">Loading pending transfers…</p>
      </div>
    );
  }

  if (!transfers.length) {
    return (
      <div className="py-8 text-center">
        <ArrowLeftRight className="h-7 w-7 text-slate-200 mx-auto mb-2" />
        <p className="text-sm text-ink-subtle">No pending transfer requests.</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-[#23252a]">
      {transfers.map(t => {
        const actState = actionStates[t.id];
        const isRejecting = rejectingId === t.id;
        return (
          <li key={t.id} className="py-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-ink">
                    {t.asset?.name ?? t.assetId}
                  </span>
                  {t.asset?.assetTag && (
                    <span className="font-mono text-xs text-ink-tertiary bg-slate-100 px-1.5 py-0.5 rounded">
                      {t.asset.assetTag}
                    </span>
                  )}
                  <Pill
                    label={t.status}
                    cls={TRANSFER_STATUS_STYLES[t.status] ?? 'bg-slate-100 text-ink-subtle ring-1 ring-slate-200'}
                  />
                </div>
                <div className="mt-1 text-xs text-ink-subtle space-y-0.5">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Requested by {t.requestedBy?.name ?? 'Unknown'} · {formatDate(t.createdAt)}
                  </div>
                  {t.toUser && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3 text-primary" />
                      To: {t.toUser.name}
                    </div>
                  )}
                  {t.toDeptId && !t.toUser && (
                    <div className="flex items-center gap-1">
                      <Building2 className="h-3 w-3 text-primary" />
                      To dept: {departments.find(d => d.id === t.toDeptId)?.name ?? t.toDeptId}
                    </div>
                  )}
                  {t.reason && (
                    <div className="italic text-ink-tertiary">"{t.reason}"</div>
                  )}
                </div>
              </div>

              {t.status === 'REQUESTED' && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleApprove(t.id)}
                    disabled={actState === 'approving'}
                    className="flex items-center gap-1 text-xs font-medium btn-primary px-3 py-1.5 rounded-md transition-colors"
                  >
                    {actState === 'approving'
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : <CheckCircle2 className="h-3.5 w-3.5" />}
                    Approve
                  </button>
                  <button
                    onClick={() => { setRejectingId(t.id); setRejectReason(''); }}
                    disabled={actState === 'rejecting'}
                    className="flex items-center gap-1 text-xs font-medium btn-danger px-3 py-1.5 rounded-md transition-colors"
                  >
                    <Ban className="h-3.5 w-3.5" />
                    Reject
                  </button>
                </div>
              )}
            </div>

            {isRejecting && (
              <div className="mt-3 flex gap-2 items-end">
                <div className="flex-1">
                  <label className="field-label">Rejection reason <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    placeholder="Enter reason for rejection"
                    className="input-field"
                  />
                </div>
                <button
                  onClick={() => handleReject(t.id)}
                  disabled={!rejectReason.trim() || actState === 'rejecting'}
                  className="flex items-center gap-1 text-xs font-medium btn-danger px-3 py-2 rounded-md transition-colors"
                >
                  {actState === 'rejecting' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Ban className="h-3.5 w-3.5" />}
                  Confirm
                </button>
                <button
                  onClick={() => setRejectingId(null)}
                  className="text-xs text-ink-subtle hover:text-[#c9d1d9] px-3 py-2"
                >
                  Cancel
                </button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

// ─── Allocate / Transfer Panel ─────────────────────────────────────────────────
function AllocatePanel({ assets, users, departments, onSuccess }) {
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Allocation form
  const [userId, setUserId] = useState('');
  const [expectedReturn, setExpectedReturn] = useState('');
  const [allocError, setAllocError] = useState('');
  const [allocLoading, setAllocLoading] = useState(false);

  // Conflict state (409 response)
  const [conflictHolder, setConflictHolder] = useState(null);

  // Transfer form (shown on conflict)
  const [transferToType, setTransferToType] = useState('user'); // 'user' | 'dept'
  const [transferToUser, setTransferToUser] = useState('');
  const [transferToDept, setTransferToDept] = useState('');
  const [transferReason, setTransferReason] = useState('');
  const [transferError, setTransferError] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);

  function selectAsset(a) {
    setSelectedAsset(a);
    // Reset forms
    setConflictHolder(null);
    setAllocError('');
    setTransferError('');
    setUserId('');
    setExpectedReturn('');
  }

  async function handleAllocate(e) {
    e.preventDefault();
    if (!selectedAsset) return setAllocError('Please select an asset.');
    if (!userId) return setAllocError('Please select a user.');
    setAllocLoading(true);
    setAllocError('');
    setConflictHolder(null);
    try {
      const body = { assetId: selectedAsset.id, userId };
      if (expectedReturn) body.expectedReturn = new Date(expectedReturn).toISOString();
      await createAllocation(body);
      onSuccess(`Asset "${selectedAsset.name}" successfully allocated.`);
      setSelectedAsset(null);
      setUserId('');
      setExpectedReturn('');
    } catch (err) {
      if (err?.response?.status === 409) {
        const data = err.response.data;
        const holder = data?.currentHolder ?? data?.data?.currentHolder ?? null;
        setConflictHolder(holder);
      } else {
        setAllocError(err?.response?.data?.message || 'Allocation failed. Please try again.');
      }
    } finally {
      setAllocLoading(false);
    }
  }

  async function handleTransfer(e) {
    e.preventDefault();
    if (!selectedAsset) return;
    if (transferToType === 'user' && !transferToUser) return setTransferError('Please select a recipient user.');
    if (transferToType === 'dept' && !transferToDept) return setTransferError('Please select a destination department.');
    if (!transferReason.trim()) return setTransferError('Please provide a reason for the transfer.');
    setTransferLoading(true);
    setTransferError('');
    try {
      const body = { assetId: selectedAsset.id, reason: transferReason };
      if (transferToType === 'user') body.toUserId = transferToUser;
      else body.toDeptId = transferToDept;
      await createTransfer(body);
      onSuccess(`Transfer request submitted for "${selectedAsset.name}".`);
      setConflictHolder(null);
      setSelectedAsset(null);
      setTransferReason('');
      setTransferToUser('');
      setTransferToDept('');
    } catch (err) {
      setTransferError(err?.response?.data?.message || 'Transfer request failed. Please try again.');
    } finally {
      setTransferLoading(false);
    }
  }

  const isAvailable = selectedAsset?.status === 'AVAILABLE';
  const isAllocated = selectedAsset?.status === 'ALLOCATED';

  return (
    <div className="space-y-5">
      {/* Asset search */}
      <div>
        <label className="field-label">
          Select Asset <span className="text-red-500">*</span>
        </label>
        <AssetSelector value={selectedAsset} onChange={selectAsset} />
      </div>

      {/* Selected asset info */}
      {selectedAsset && (
        <div className="flex items-center gap-3 bg-surface-2 border border-hairline rounded-lg px-4 py-3">
          <Package className="h-5 w-5 text-primary flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-ink">{selectedAsset.name}</p>
            <p className="text-xs text-ink-subtle">{selectedAsset.assetTag} · {selectedAsset.category?.name ?? '—'}</p>
          </div>
          <StatusBadge type="asset" status={selectedAsset.status} />
        </div>
      )}

      {/* ── CONFLICT PATH ───────────────────────────────────────── */}
      {conflictHolder && (
        <>
          <ConflictBanner currentHolder={conflictHolder} />
          <form onSubmit={handleTransfer} className="space-y-4 border border-hairline rounded-lg p-4 bg-canvas">
            <p className="field-label">Transfer Request</p>
            {transferError && <ErrorAlert message={transferError} />}

            {/* To type selector */}
            <div>
              <label className="field-label">Transfer to</label>
              <div className="flex gap-3">
                <label className="flex items-center gap-1.5 text-sm text-[#c9d1d9] cursor-pointer">
                  <input
                    type="radio"
                    name="toType"
                    value="user"
                    checked={transferToType === 'user'}
                    onChange={() => setTransferToType('user')}
                    className="accent-indigo-600"
                  />
                  Employee
                </label>
                <label className="flex items-center gap-1.5 text-sm text-[#c9d1d9] cursor-pointer">
                  <input
                    type="radio"
                    name="toType"
                    value="dept"
                    checked={transferToType === 'dept'}
                    onChange={() => setTransferToType('dept')}
                    className="accent-indigo-600"
                  />
                  Department
                </label>
              </div>
            </div>

            {transferToType === 'user' ? (
              <div>
                <label className="field-label">Employee <span className="text-red-500">*</span></label>
                <select
                  value={transferToUser}
                  onChange={e => setTransferToUser(e.target.value)}
                  className="input-field"
                >
                  <option value="">Select employee</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} — {u.department?.name ?? u.role}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="field-label">Department <span className="text-red-500">*</span></label>
                <select
                  value={transferToDept}
                  onChange={e => setTransferToDept(e.target.value)}
                  className="input-field"
                >
                  <option value="">Select department</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="field-label">Reason <span className="text-red-500">*</span></label>
              <textarea
                value={transferReason}
                onChange={e => setTransferReason(e.target.value)}
                rows={2}
                placeholder="Reason for the transfer request…"
                className="input-field"
              />
            </div>

            <button
              type="submit"
              disabled={transferLoading}
              className="flex items-center gap-1.5 btn-primary text-sm font-medium px-4 py-2 rounded-md transition-colors"
            >
              {transferLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              Submit Transfer Request
            </button>
          </form>
        </>
      )}

      {/* ── AVAILABLE PATH — Allocation form ───────────────────── */}
      {selectedAsset && isAvailable && !conflictHolder && (
        <form onSubmit={handleAllocate} className="space-y-4 border border-hairline rounded-lg p-4 bg-canvas">
          <p className="field-label">Allocate Asset</p>
          {allocError && <ErrorAlert message={allocError} />}
          <div>
            <label className="field-label">Assign to Employee <span className="text-red-500">*</span></label>
            <select
              value={userId}
              onChange={e => setUserId(e.target.value)}
              className="input-field"
            >
              <option value="">Select employee</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name} — {u.department?.name ?? u.role}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Expected Return Date <span className="text-ink-tertiary">(optional)</span></label>
            <input
              type="date"
              value={expectedReturn}
              onChange={e => setExpectedReturn(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full border border-hairline rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={allocLoading}
            className="flex items-center gap-1.5 btn-primary text-sm font-medium px-4 py-2 rounded-md transition-colors"
          >
            {allocLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
            Allocate Asset
          </button>
        </form>
      )}

      {/* Already allocated — hint before conflict is triggered */}
      {selectedAsset && isAllocated && !conflictHolder && (
        <div className="flex items-start gap-3 bg-status-allocated-bg border border-status-allocated rounded-lg px-4 py-3 text-sm">
          <AlertCircle className="h-4 w-4 text-status-allocated mt-0.5 flex-shrink-0" />
          <div className="text-[#c9d1d9]">
            <p className="font-medium">This asset is currently allocated.</p>
            <p className="text-ink-subtle mt-0.5">To move it, click "Try Allocate" — a conflict will be detected and you'll be prompted to submit a transfer request.</p>
          </div>
        </div>
      )}

      {/* Non-available, non-allocated status — no action possible */}
      {selectedAsset && !isAvailable && !isAllocated && (
        <div className="flex items-start gap-3 bg-surface-2 border border-hairline rounded-lg px-4 py-3 text-sm text-ink-tertiary">
          <AlertCircle className="h-4 w-4 text-ink-tertiary mt-0.5 flex-shrink-0" />
          <p>This asset cannot be allocated in its current status (<strong>{selectedAsset.status}</strong>).</p>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function AllocationTransferPage() {
  const { currentUser } = useAuth();
  const isManager = canManage(currentUser);

  // Global data
  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [activeAllocations, setActiveAllocations] = useState([]);
  const [pendingTransfers, setPendingTransfers] = useState([]);

  const [loadingData, setLoadingData] = useState(true);
  const [loadingTransfers, setLoadingTransfers] = useState(true);

  // Global flash messages
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Active tab
  const [activeTab, setActiveTab] = useState('allocate'); // 'allocate' | 'active' | 'transfers'

  const fetchData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [assetsRes, usersRes, depsRes, allocRes] = await Promise.allSettled([
        getAssets({ status: undefined }),
        getUsers({ status: 'ACTIVE' }),
        getDepartments(),
        getAllocations({ status: 'ACTIVE' }),
      ]);

      if (assetsRes.status === 'fulfilled') {
        const data = assetsRes.value.data?.data ?? assetsRes.value.data ?? [];
        setAssets(Array.isArray(data) ? data : data.items ?? []);
      }
      if (usersRes.status === 'fulfilled') {
        const data = usersRes.value.data?.data ?? usersRes.value.data ?? [];
        setUsers(Array.isArray(data) ? data : data.items ?? []);
      }
      if (depsRes.status === 'fulfilled') {
        const data = depsRes.value.data?.data ?? depsRes.value.data ?? [];
        setDepartments(Array.isArray(data) ? data : data.items ?? []);
      }
      if (allocRes.status === 'fulfilled') {
        const data = allocRes.value.data?.data ?? allocRes.value.data ?? [];
        setActiveAllocations(Array.isArray(data) ? data : data.items ?? []);
      }
    } finally {
      setLoadingData(false);
    }
  }, []);

  const fetchTransfers = useCallback(async () => {
    if (!isManager) { setLoadingTransfers(false); return; }
    setLoadingTransfers(true);
    try {
      const res = await getTransfers({ status: 'REQUESTED' });
      const data = res.data?.data ?? res.data ?? [];
      setPendingTransfers(Array.isArray(data) ? data : data.items ?? []);
    } catch {
      // ignore, backend offline
    } finally {
      setLoadingTransfers(false);
    }
  }, [isManager]);

  useEffect(() => { fetchData(); fetchTransfers(); }, [fetchData, fetchTransfers]);

  function showSuccess(msg) {
    setSuccessMsg(msg);
    setErrorMsg('');
    fetchData();
    fetchTransfers();
  }

  function handleTransferAction(successMessage, errMessage) {
    if (errMessage) {
      setErrorMsg(errMessage);
    } else {
      showSuccess(successMessage);
    }
  }

  const tabs = [
    { key: 'allocate',  label: 'Allocate / Transfer',   icon: ArrowLeftRight },
    { key: 'active',    label: 'Active Allocations',     icon: ClipboardList, count: activeAllocations.length },
    ...(isManager ? [{ key: 'transfers', label: 'Pending Transfers', icon: RefreshCw, count: pendingTransfers.length }] : []),
  ];

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto' }}>
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ArrowLeftRight size={18} color='var(--color-primary)' style={{ flexShrink: 0 }} />
          <div>
            <h1 className="type-display-md" style={{ color: 'var(--color-ink)', margin: 0 }}>Allocation & Transfers</h1>
            <p className="type-body-sm" style={{ color: 'var(--color-ink-subtle)', marginTop: 6 }}>Manage asset allocation, returns, and transfer requests</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Flash messages */}
        {successMsg && <SuccessAlert message={successMsg} onDismiss={() => setSuccessMsg('')} />}
        {errorMsg && <ErrorAlert message={errorMsg} />}

        {/* Tab bar container */}
        <div style={{ backgroundColor: 'var(--color-surface-1)', border: '1px solid #23252a', borderRadius: 12, overflow: 'visible' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #23252a' }} role="tablist">
            {tabs.map(tab => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  role="tab"
                  aria-selected={isActive}
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

          {/* Tab contents */}
          {activeTab === 'allocate' && (
            <div style={{ padding: 24 }}>
              {loadingData ? (
                <div style={{ padding: '40px 0', textAlign: 'center' }}>
                  <Loader2 size={28} color='var(--color-primary)' style={{ margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
                  <p style={{ fontSize: 14, color: 'var(--color-ink-subtle)', margin: 0 }}>Loading assets and users…</p>
                </div>
              ) : (
                <AllocatePanel assets={assets} users={users} departments={departments} onSuccess={showSuccess} />
              )}
            </div>
          )}

          {activeTab === 'active' && (
            <div style={{ padding: '16px 24px' }}>
              <SectionTitle icon={ClipboardList} title="Active Allocations" subtitle="Assets currently assigned to employees" />
              <ActiveAllocationsList allocations={activeAllocations} loading={loadingData} onReturnSuccess={showSuccess} />
            </div>
          )}

          {activeTab === 'transfers' && isManager && (
            <div style={{ padding: '16px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <SectionTitle icon={RefreshCw} title="Pending Transfer Requests" subtitle="Approve or reject queued asset transfers" />
                <button onClick={fetchTransfers} className="btn-tertiary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <RefreshCw size={14} /> Refresh
                </button>
              </div>
              <PendingTransfersList transfers={pendingTransfers} departments={departments} loading={loadingTransfers} onAction={handleTransferAction} />
            </div>
          )}
        </div>

        {/* Role notice */}
        {!isManager && (
          <p style={{ fontSize: 12, color: 'var(--color-ink-tertiary)', textAlign: 'center' }}>
            Transfer approvals and allocations are restricted to Asset Managers and Admins.
          </p>
        )}
      </div>
    </div>
  );
}
