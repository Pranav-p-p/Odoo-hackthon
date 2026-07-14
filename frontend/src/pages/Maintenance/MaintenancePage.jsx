// ============================================================================
// MaintenancePage.jsx — Dark Canvas (DESIGN.md)
// 5-column Kanban board — button-click state transitions (no drag per TECH_STACK_FREEZE.md)
// Priority badges use semantic spectrum fills; column headers use DESIGN.md token colors.
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import {
  Wrench, Plus, X, CheckCircle, XCircle, User, Play, Check,
  AlertTriangle, RefreshCw, ChevronRight,
} from 'lucide-react';
import {
  getMaintenanceRequests, createMaintenanceRequest,
  approveRequest, rejectRequest, assignTechnician,
  startWork, resolveRequest, getAssets, getUsers,
} from '../../api/maintenanceApi.js';

// ─── Kanban column definitions ─────────────────────────────────────────────────
// topColor = 3px top border on each column — matches DESIGN.md semantic spectrum
const KANBAN_COLUMNS = [
  { key: 'PENDING_APPROVAL',    label: 'Pending',             topColor: 'var(--color-status-maintenance)', countBg: 'var(--color-status-maintenance-bg)',  countColor: 'var(--color-status-maintenance)' },
  { key: 'APPROVED',            label: 'Approved',            topColor: 'var(--color-status-allocated)', countBg: 'var(--color-status-allocated-bg)',  countColor: 'var(--color-status-allocated)' },
  { key: 'TECHNICIAN_ASSIGNED', label: 'Technician Assigned', topColor: 'var(--color-primary-hover)', countBg: 'var(--color-badge-brand-bg)',  countColor: 'var(--color-primary-hover)' },
  { key: 'IN_PROGRESS',         label: 'In Progress',         topColor: 'var(--color-status-maintenance)', countBg: 'var(--color-status-maintenance-bg)',  countColor: 'var(--color-status-maintenance)' },
  { key: 'RESOLVED',            label: 'Resolved',            topColor: 'var(--color-status-available)', countBg: 'var(--color-status-available-bg)',   countColor: 'var(--color-status-available)' },
];

// Priority pill styles — semantic spectrum fills
const PRIORITY_STYLES = {
  CRITICAL: { bg: 'rgba(248,81,73,0.16)',   color: 'var(--color-semantic-error)' },
  HIGH:     { bg: 'var(--color-status-maintenance-bg)',  color: 'var(--color-status-maintenance)' },
  MEDIUM:   { bg: 'var(--color-status-allocated-bg)', color: 'var(--color-status-allocated)' },
  LOW:      { bg: 'var(--color-status-disposed-bg)', color: 'var(--color-status-disposed)' },
};
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

// ─── Shared dark-canvas modal overlay ─────────────────────────────────────────
function ModalOverlay({ onClose, title, icon, children }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.70)', backdropFilter: 'blur(4px)', padding: 16,
    }}>
      {/* Click-outside closes */}
      <div style={{ position: 'absolute', inset: 0 }} onClick={onClose} aria-hidden="true" />
      <div style={{
        position: 'relative',
        backgroundColor: 'var(--color-surface-3)',           /* surface-3 — modal-panel level */
        border:          '1px solid #34343a',
        borderRadius:    12,
        boxShadow:       '0 24px 64px rgba(0,0,0,0.60)',
        width:           '100%',
        maxWidth:        440,
      }}>
        {/* Modal header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #23252a' }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-ink)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            {icon}{title}
          </h3>
          <button onClick={onClose} className="btn-icon-row" aria-label="Close modal">
            <X size={16} />
          </button>
        </div>
        <div style={{ padding: '20px' }}>{children}</div>
      </div>
    </div>
  );
}

/* Shared modal input style */
const MODAL_INPUT = {
  width:           '100%',
  backgroundColor: 'var(--color-surface-1)',
  border:          '1px solid #23252a',
  borderRadius:    8,
  padding:         '8px 12px',
  fontSize:        13,
  color:           'var(--color-ink)',
  outline:         'none',
  boxSizing:       'border-box',
};

const MODAL_LABEL = {
  display:     'block',
  fontSize:    12,
  fontWeight:  600,
  color:       'var(--color-ink-subtle)',
  letterSpacing: '0.6px',
  textTransform: 'uppercase',
  marginBottom: 6,
};

function ModalError({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, backgroundColor: 'var(--color-semantic-error-bg)', border: '1px solid var(--color-semantic-error)', borderRadius: 8, padding: '8px 12px', color: 'var(--color-semantic-error)', fontSize: 13, marginBottom: 16 }}>
      <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
      <span>{msg}</span>
    </div>
  );
}

// ─── Raise Request Modal ───────────────────────────────────────────────────────
function RaiseRequestModal({ onClose, onSuccess, assets }) {
  const [assetId, setAssetId]         = useState(assets[0]?.id ?? '');
  const [issueDescription, setIssue]  = useState('');
  const [priority, setPriority]       = useState('MEDIUM');
  const [photoUrl, setPhotoUrl]       = useState('');
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!assetId || !issueDescription) return;
    setSubmitting(true); setError('');
    try {
      await createMaintenanceRequest({ assetId, issueDescription, priority, photoUrl: photoUrl || null });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error?.message ?? 'Failed to raise request.');
    } finally { setSubmitting(false); }
  };

  return (
    <ModalOverlay onClose={onClose} title="Raise Maintenance Request" icon={<Wrench size={16} color='var(--color-status-maintenance)' />}>
      <form onSubmit={handleSubmit} id="raise-request-form">
        <ModalError msg={error} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label htmlFor="maint-asset" style={MODAL_LABEL}>Asset</label>
            <select id="maint-asset" value={assetId} onChange={e => setAssetId(e.target.value)} required style={MODAL_INPUT}>
              {assets.map(a => <option key={a.id} value={a.id}>{a.assetTag} — {a.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="maint-issue" style={MODAL_LABEL}>Issue Description</label>
            <textarea id="maint-issue" value={issueDescription} onChange={e => setIssue(e.target.value)} required rows={3}
              placeholder="Describe the issue clearly…" style={{ ...MODAL_INPUT, resize: 'none' }} />
          </div>
          <div>
            <label htmlFor="maint-priority" style={MODAL_LABEL}>Priority</label>
            <select id="maint-priority" value={priority} onChange={e => setPriority(e.target.value)} style={MODAL_INPUT}>
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="maint-photo" style={MODAL_LABEL}>
              Photo URL <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
            </label>
            <input id="maint-photo" type="text" value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} placeholder="https://…" style={MODAL_INPUT} />
          </div>
          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
              {submitting ? 'Submitting…' : 'Raise Request'}
            </button>
          </div>
        </div>
      </form>
    </ModalOverlay>
  );
}

// ─── Assign Technician Modal ───────────────────────────────────────────────────
function AssignTechnicianModal({ request, users, onClose, onSuccess }) {
  const [technicianId, setTechnicianId] = useState(users[0]?.id ?? '');
  const [submitting, setSubmitting]     = useState(false);
  const [error, setError]               = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!technicianId) return;
    setSubmitting(true); setError('');
    try {
      await assignTechnician(request.id, technicianId);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error?.message ?? 'Failed to assign technician.');
    } finally { setSubmitting(false); }
  };

  return (
    <ModalOverlay onClose={onClose} title="Assign Technician" icon={<User size={16} color='var(--color-primary-hover)' />}>
      <div style={{ backgroundColor: 'var(--color-surface-2)', border: '1px solid #23252a', borderRadius: 8, padding: '10px 12px', marginBottom: 16, fontSize: 13, color: 'var(--color-ink-muted)' }}>
        <strong style={{ color: 'var(--color-ink)' }}>{request.asset?.assetTag}</strong> — {request.asset?.name}
        <br /><span style={{ color: 'var(--color-ink-subtle)' }}>{request.issueDescription}</span>
      </div>
      <form onSubmit={handleSubmit} id="assign-tech-form">
        <ModalError msg={error} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label htmlFor="technician-select" style={MODAL_LABEL}>Technician</label>
            <select id="technician-select" value={technicianId} onChange={e => setTechnicianId(e.target.value)} required style={MODAL_INPUT}>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
              {submitting ? 'Assigning…' : 'Assign'}
            </button>
          </div>
        </div>
      </form>
    </ModalOverlay>
  );
}

// ─── Resolve Modal ─────────────────────────────────────────────────────────────
function ResolveModal({ request, onClose, onSuccess }) {
  const [resolvedNotes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resolvedNotes.trim()) return;
    setSubmitting(true); setError('');
    try {
      await resolveRequest(request.id, resolvedNotes);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error?.message ?? 'Failed to resolve.');
    } finally { setSubmitting(false); }
  };

  return (
    <ModalOverlay onClose={onClose} title="Resolve Maintenance Request" icon={<Check size={16} color='var(--color-status-available)' />}>
      <div style={{ backgroundColor: 'var(--color-surface-2)', border: '1px solid #23252a', borderRadius: 8, padding: '10px 12px', marginBottom: 16, fontSize: 13, color: 'var(--color-ink-muted)' }}>
        <strong style={{ color: 'var(--color-ink)' }}>{request.asset?.assetTag}</strong> — {request.asset?.name}
        <br /><span style={{ color: 'var(--color-ink-subtle)' }}>{request.issueDescription}</span>
      </div>
      <form onSubmit={handleSubmit} id="resolve-form">
        <ModalError msg={error} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label htmlFor="resolve-notes" style={MODAL_LABEL}>Resolution Notes</label>
            <textarea id="resolve-notes" value={resolvedNotes} onChange={e => setNotes(e.target.value)} required rows={3}
              placeholder="Describe what was fixed…" style={{ ...MODAL_INPUT, resize: 'none' }} />
          </div>
          <p style={{ fontSize: 12, color: 'var(--color-ink-subtle)', margin: 0 }}>
            Resolving will set asset status back to <strong style={{ color: 'var(--color-status-available)' }}>AVAILABLE</strong>.
          </p>
          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
              {submitting ? 'Resolving…' : 'Mark Resolved'}
            </button>
          </div>
        </div>
      </form>
    </ModalOverlay>
  );
}

// ─── Reject Modal ──────────────────────────────────────────────────────────────
function RejectModal({ request, onClose, onSuccess }) {
  const [reason, setReason]         = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setError('');
    try {
      await rejectRequest(request.id, reason);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error?.message ?? 'Failed to reject.');
    } finally { setSubmitting(false); }
  };

  return (
    <ModalOverlay onClose={onClose} title="Reject Request" icon={<XCircle size={16} color='var(--color-semantic-error)' />}>
      <div style={{ backgroundColor: 'var(--color-surface-2)', border: '1px solid #23252a', borderRadius: 8, padding: '10px 12px', marginBottom: 16, fontSize: 13, color: 'var(--color-ink-muted)' }}>
        <strong style={{ color: 'var(--color-ink)' }}>{request.asset?.assetTag}</strong> — {request.issueDescription}
      </div>
      <form onSubmit={handleSubmit} id="reject-form">
        <ModalError msg={error} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label htmlFor="reject-reason" style={MODAL_LABEL}>
              Reason <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
            </label>
            <textarea id="reject-reason" value={reason} onChange={e => setReason(e.target.value)} rows={2}
              placeholder="Reason for rejection…" style={{ ...MODAL_INPUT, resize: 'none' }} />
          </div>
          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
            <button type="submit" disabled={submitting} className="btn-danger" style={{ flex: 1, justifyContent: 'center' }}>
              {submitting ? 'Rejecting…' : 'Reject Request'}
            </button>
          </div>
        </div>
      </form>
    </ModalOverlay>
  );
}

// ─── Maintenance Kanban Card ───────────────────────────────────────────────────
function MaintenanceCard({ request, onApprove, onReject, onAssign, onStart, onResolve, actionLoading }) {
  const priority  = PRIORITY_STYLES[request.priority] ?? PRIORITY_STYLES.MEDIUM;
  const isLoading = actionLoading === request.id;

  return (
    <div style={{
      backgroundColor: 'var(--color-surface-2)',    /* surface-2 */
      border:          '1px solid #23252a',
      borderRadius:    10,
      padding:         '14px',
      display:         'flex',
      flexDirection:   'column',
      gap:             10,
    }}>
      {/* ── Asset + Priority ──────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-ink)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {request.asset?.assetTag ?? '—'}
          </p>
          <p style={{ fontSize: 11, color: 'var(--color-ink-subtle)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {request.asset?.name}
          </p>
        </div>
        <span style={{
          flexShrink: 0, fontSize: 10, fontWeight: 700, letterSpacing: '0.8px',
          textTransform: 'uppercase', padding: '2px 8px', borderRadius: 9999,
          backgroundColor: priority.bg, color: priority.color,
        }}>
          {request.priority}
        </span>
      </div>

      {/* ── Issue description ─────────────────────────────────────────── */}
      <p style={{
        fontSize: 12, color: 'var(--color-ink-muted)', margin: 0,
        display: '-webkit-box', WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical', overflow: 'hidden',
        lineHeight: 1.5,
      }}>
        {request.issueDescription}
      </p>

      {/* ── Meta: raised by / technician ─────────────────────────────── */}
      <div style={{ fontSize: 11, color: 'var(--color-ink-tertiary)' }}>
        <p style={{ margin: 0 }}>Raised by: <span style={{ color: 'var(--color-ink-subtle)', fontWeight: 500 }}>{request.requestedBy?.name ?? '—'}</span></p>
        {request.technician && (
          <p style={{ margin: '2px 0 0' }}>Tech: <span style={{ color: 'var(--color-ink-subtle)', fontWeight: 500 }}>{request.technician.name}</span></p>
        )}
      </div>

      {/* ── Action buttons ────────────────────────────────────────────── */}
      <div>
        {request.status === 'PENDING_APPROVAL' && (
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => onApprove(request.id)} disabled={isLoading}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 11, fontWeight: 600, padding: '6px', borderRadius: 6, border: 'none', cursor: 'pointer', backgroundColor: 'rgba(63,185,80,0.16)', color: 'var(--color-status-available)', transition: 'background-color var(--duration-fast) var(--ease-standard)' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(63,185,80,0.24)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(63,185,80,0.16)'}
            >
              <CheckCircle size={12} /> Approve
            </button>
            <button onClick={() => onReject(request)} disabled={isLoading}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 11, fontWeight: 600, padding: '6px', borderRadius: 6, border: '1px solid rgba(248,81,73,0.30)', cursor: 'pointer', backgroundColor: 'rgba(248,81,73,0.08)', color: 'var(--color-semantic-error)', transition: 'background-color var(--duration-fast) var(--ease-standard)' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(248,81,73,0.16)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(248,81,73,0.08)'}
            >
              <XCircle size={12} /> Reject
            </button>
          </div>
        )}

        {request.status === 'APPROVED' && (
          <button onClick={() => onAssign(request)} disabled={isLoading}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 11, fontWeight: 600, padding: '7px', borderRadius: 6, border: 'none', cursor: 'pointer', backgroundColor: 'var(--color-badge-brand-bg)', color: 'var(--color-primary-hover)', transition: 'background-color var(--duration-fast) var(--ease-standard)' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(94,106,210,0.24)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--color-badge-brand-bg)'}
          >
            <User size={12} /> Assign Technician
          </button>
        )}

        {request.status === 'TECHNICIAN_ASSIGNED' && (
          <button onClick={() => onStart(request.id)} disabled={isLoading}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 11, fontWeight: 600, padding: '7px', borderRadius: 6, border: 'none', cursor: 'pointer', backgroundColor: 'var(--color-status-maintenance-bg)', color: 'var(--color-status-maintenance)', transition: 'background-color var(--duration-fast) var(--ease-standard)' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(210,153,34,0.24)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--color-status-maintenance-bg)'}
          >
            <Play size={12} /> Start Work
          </button>
        )}

        {request.status === 'IN_PROGRESS' && (
          <button onClick={() => onResolve(request)} disabled={isLoading}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 11, fontWeight: 600, padding: '7px', borderRadius: 6, border: 'none', cursor: 'pointer', backgroundColor: 'rgba(63,185,80,0.16)', color: 'var(--color-status-available)', transition: 'background-color var(--duration-fast) var(--ease-standard)' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(63,185,80,0.24)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(63,185,80,0.16)'}
          >
            <Check size={12} /> Mark Resolved
          </button>
        )}

        {request.status === 'RESOLVED' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--color-status-available)', backgroundColor: 'var(--color-status-available-bg)', borderRadius: 6, padding: '6px 10px' }}>
            <CheckCircle size={12} /> Resolved
            {request.resolvedNotes && (
              <span style={{ color: 'var(--color-ink-subtle)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                — {request.resolvedNotes}
              </span>
            )}
          </div>
        )}

        {isLoading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 11, color: 'var(--color-ink-tertiary)', paddingTop: 4 }}>
            <RefreshCw size={11} style={{ animation: 'spin 1s linear infinite' }} /> Processing…
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Card Skeleton ─────────────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div style={{ backgroundColor: 'var(--color-surface-2)', border: '1px solid #23252a', borderRadius: 10, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ height: 13, backgroundColor: 'var(--color-hairline)', borderRadius: 4, width: '40%', marginBottom: 6 }} />
          <div style={{ height: 11, backgroundColor: 'var(--color-hairline)', borderRadius: 4, width: '60%' }} />
        </div>
        <div style={{ height: 18, width: 52, backgroundColor: 'var(--color-hairline)', borderRadius: 9999 }} />
      </div>
      <div>
        <div style={{ height: 11, backgroundColor: 'var(--color-hairline)', borderRadius: 4, marginBottom: 4 }} />
        <div style={{ height: 11, backgroundColor: 'var(--color-hairline)', borderRadius: 4, width: '80%' }} />
      </div>
      <div style={{ height: 28, backgroundColor: 'var(--color-hairline)', borderRadius: 6 }} />
    </div>
  );
}

// ─── Kanban Column ─────────────────────────────────────────────────────────────
function KanbanColumn({ column, requests, onApprove, onReject, onAssign, onStart, onResolve, actionLoading, isLoading }) {
  return (
    <div style={{
      display:         'flex',
      flexDirection:   'column',
      minWidth:        220,
      flex:            1,
      backgroundColor: '#0a0a0b',    /* slightly darker than canvas */
      border:          '1px solid #23252a',
      borderTop:       `3px solid ${column.topColor}`,
      borderRadius:    10,
      overflow:        'hidden',
    }}>
      {/* Column header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderBottom: '1px solid #23252a' }}>
        <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-ink)', margin: 0, letterSpacing: '0.4px', textTransform: 'uppercase' }}>
          {column.label}
        </h3>
        <span style={{
          fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 9999,
          backgroundColor: column.countBg, color: column.countColor,
        }}>
          {requests.length}
        </span>
      </div>

      {/* Card list */}
      <div style={{ flex: 1, overflowY: 'auto', maxHeight: 'calc(100vh - 280px)', padding: '10px 10px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {isLoading && requests.length === 0 ? (
          <><CardSkeleton /><CardSkeleton /></>
        ) : requests.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 80, color: 'var(--color-hairline-tertiary)', fontSize: 12 }}>
            <ChevronRight size={18} style={{ marginBottom: 4, opacity: 0.4 }} />
            No requests
          </div>
        ) : (
          requests.map(r => (
            <MaintenanceCard
              key={r.id} request={r}
              onApprove={onApprove} onReject={onReject} onAssign={onAssign}
              onStart={onStart} onResolve={onResolve} actionLoading={actionLoading}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function MaintenancePage() {
  const [requests, setRequests]           = useState([]);
  const [assets, setAssets]               = useState([]);
  const [users, setUsers]                 = useState([]);
  const [loading, setLoading]             = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [globalError, setGlobalError]     = useState('');

  const [showRaiseModal, setShowRaiseModal] = useState(false);
  const [assignTarget, setAssignTarget]     = useState(null);
  const [resolveTarget, setResolveTarget]   = useState(null);
  const [rejectTarget, setRejectTarget]     = useState(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true); setGlobalError('');
    try {
      const res = await getMaintenanceRequests();
      setRequests(res.data ?? []);
    } catch (err) {
      setGlobalError(err.response?.data?.error?.message ?? 'Failed to load maintenance requests.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchRequests();
    getAssets().then(setAssets);
    getUsers().then(setUsers);
  }, [fetchRequests]);

  const grouped = KANBAN_COLUMNS.reduce((acc, col) => {
    acc[col.key] = requests.filter(r => r.status === col.key);
    return acc;
  }, {});

  const handleApprove = async (id) => {
    setActionLoading(id); setGlobalError('');
    try { await approveRequest(id); await fetchRequests(); }
    catch (err) { setGlobalError(err.response?.data?.error?.message ?? 'Failed to approve.'); }
    finally { setActionLoading(null); }
  };

  const handleStart = async (id) => {
    setActionLoading(id); setGlobalError('');
    try { await startWork(id); await fetchRequests(); }
    catch (err) { setGlobalError(err.response?.data?.error?.message ?? 'Failed to start work.'); }
    finally { setActionLoading(null); }
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Wrench size={18} color='var(--color-status-maintenance)' />
          <div>
            <h1 className="type-display-md" style={{ color: 'var(--color-ink)', margin: 0 }}>Maintenance</h1>
            <p className="type-body-sm" style={{ color: 'var(--color-ink-subtle)', marginTop: 4 }}>
              Track and manage asset maintenance requests across the organization.
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={fetchRequests} className="btn-secondary">
            <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
          <button id="raise-request-btn" onClick={() => setShowRaiseModal(true)} className="btn-primary">
            <Plus size={14} /> Raise Request
          </button>
        </div>
      </div>

      {/* ── Global error ──────────────────────────────────────────────────── */}
      {globalError && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', backgroundColor: 'var(--color-semantic-error-bg)', border: '1px solid var(--color-semantic-error)', borderRadius: 8, marginBottom: 20, color: 'var(--color-semantic-error)', fontSize: 13 }}>
          <AlertTriangle size={14} style={{ flexShrink: 0 }} />
          {globalError}
        </div>
      )}

      {/* ── Kanban Board ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 16 }}>
        {KANBAN_COLUMNS.map(col => (
          <div key={col.key} style={{ flex: '1 1 220px', minWidth: 220 }}>
            <KanbanColumn
              column={col}
              requests={grouped[col.key] ?? []}
              onApprove={handleApprove}
              onReject={req => setRejectTarget(req)}
              onAssign={req => setAssignTarget(req)}
              onStart={handleStart}
              onResolve={req => setResolveTarget(req)}
              actionLoading={actionLoading}
              isLoading={loading}
            />
          </div>
        ))}
      </div>

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      {showRaiseModal && (
        <RaiseRequestModal assets={assets} onClose={() => setShowRaiseModal(false)}
          onSuccess={() => { setShowRaiseModal(false); fetchRequests(); }} />
      )}
      {assignTarget && (
        <AssignTechnicianModal request={assignTarget} users={users} onClose={() => setAssignTarget(null)}
          onSuccess={() => { setAssignTarget(null); fetchRequests(); }} />
      )}
      {resolveTarget && (
        <ResolveModal request={resolveTarget} onClose={() => setResolveTarget(null)}
          onSuccess={() => { setResolveTarget(null); fetchRequests(); }} />
      )}
      {rejectTarget && (
        <RejectModal request={rejectTarget} onClose={() => setRejectTarget(null)}
          onSuccess={() => { setRejectTarget(null); fetchRequests(); }} />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
