import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  PlusCircle,
  AlertCircle,
  RefreshCw,
  FolderOpen,
  Calendar,
  User,
  Filter,
  CheckCircle,
  X,
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
    const map = {
      OPEN:        { bg: 'var(--color-status-allocated-bg)', color: 'var(--color-status-allocated)',  label: 'Open' },
      IN_PROGRESS: { bg: 'var(--color-status-maintenance-bg)', color: 'var(--color-status-maintenance)',  label: 'In Progress' },
      CLOSED:      { bg: 'var(--color-status-available-bg)',  color: 'var(--color-status-available)',  label: 'Closed' },
    };
    const cfg = map[status];
    if (!cfg) return null;
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', borderRadius: 9999, padding: '2px 10px', fontSize: 11, fontWeight: 600, backgroundColor: cfg.bg, color: cfg.color }}>
        {cfg.label}
      </span>
    );
  };

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto' }}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ClipboardCheck size={18} color='var(--color-primary)' />
          <div>
            <h1 className="type-display-md" style={{ color: 'var(--color-ink)', margin: 0 }}>Audit Cycles</h1>
            <p className="type-body-sm" style={{ color: 'var(--color-ink-subtle)', marginTop: 6 }}>Schedule physical audits, verify assets, and compile discrepancy logs.</p>
          </div>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary">
          <PlusCircle size={14} /> New Audit Cycle
        </button>
      </div>

      {/* ── Main split layout ─────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>

        {/* Left: Cycle list */}
        <div className="feature-card" style={{ alignSelf: 'start' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 14, borderBottom: '1px solid #23252a', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FolderOpen size={15} color='var(--color-ink-subtle)' />
              <h2 className="type-card-title" style={{ margin: 0, color: 'var(--color-ink)' }}>Active Cycles</h2>
            </div>
            <button onClick={fetchCycles} className="btn-icon-row" aria-label="Refresh cycles">
              <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            </button>
          </div>

          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 0' }}>
              <RefreshCw size={18} color='var(--color-hairline-tertiary)' style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          ) : cycles.length === 0 ? (
            <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--color-ink-tertiary)', fontSize: 13 }}>No audit cycles registered yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {cycles.map(cycle => (
                <button
                  key={cycle.id}
                  onClick={() => handleSelectCycle(cycle.id)}
                  style={{ width: '100%', textAlign: 'left', padding: '12px 0 12px 10px', borderLeft: `3px solid ${selectedCycle?.id === cycle.id ? 'var(--color-primary)' : 'transparent'}`, borderTop: 'none', borderRight: 'none', borderBottom: '1px solid #23252a', background: selectedCycle?.id === cycle.id ? 'rgba(94,106,210,0.06)' : 'transparent', cursor: 'pointer', transition: 'background-color var(--duration-fast) var(--ease-standard)' }}
                  onMouseEnter={e => { if (selectedCycle?.id !== cycle.id) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'; }}
                  onMouseLeave={e => { if (selectedCycle?.id !== cycle.id) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-ink)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cycle.name}</p>
                      <p style={{ fontSize: 11, color: 'var(--color-ink-tertiary)', margin: '3px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <User size={10} />{cycle.auditor.name}
                      </p>
                      <p className="type-mono" style={{ color: 'var(--color-ink-tertiary)', marginTop: 2 }}>
                        {new Date(cycle.startDate).toLocaleDateString()} – {new Date(cycle.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div style={{ flexShrink: 0 }}>{getStatusBadge(cycle.status)}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: checklist details */}
        <div>
          {!selectedCycle ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 16px', backgroundColor: 'var(--color-surface-1)', border: '1px solid #23252a', borderRadius: 12, textAlign: 'center' }}>
              <ClipboardCheck size={40} color='var(--color-hairline-tertiary)' style={{ marginBottom: 16 }} />
              <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-ink)', margin: 0 }}>No Cycle Selected</h3>
              <p className="type-body-sm" style={{ color: 'var(--color-ink-subtle)', marginTop: 6 }}>Select an audit cycle from the panel on the left to verify items.</p>
            </div>
          ) : (
            <div className="feature-card">
              {/* Cycle detail header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, paddingBottom: 16, borderBottom: '1px solid #23252a', marginBottom: 16, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-ink)', margin: 0 }}>{selectedCycle.name}</h2>
                    {getStatusBadge(selectedCycle.status)}
                  </div>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8 }}>
                    <span style={{ fontSize: 11, color: 'var(--color-ink-subtle)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <User size={11} /> Auditor: {selectedCycle.auditor.name}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--color-ink-subtle)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={11} /> Deadline: {new Date(selectedCycle.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {selectedCycle.status !== 'CLOSED' && (
                  <button onClick={handleCloseCycle} className="btn-danger">
                    <CheckCircle size={13} /> Close Audit Cycle
                  </button>
                )}
              </div>

              {/* Checklist filters */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-ink)', margin: 0 }}>
                  Verification Checklist ({checklist.length} items)
                </h3>
                <button
                  onClick={handleToggleDiscrepancies}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: '1px solid', transition: 'background-color var(--duration-fast) var(--ease-standard)', ...(filterDiscrepancies ? { backgroundColor: 'rgba(210,153,34,0.12)', borderColor: 'rgba(210,153,34,0.30)', color: 'var(--color-status-maintenance)' } : { backgroundColor: 'transparent', borderColor: 'var(--color-hairline)', color: 'var(--color-ink-subtle)' }) }}
                >
                  <Filter size={11} />
                  {filterDiscrepancies ? 'Show Full Checklist' : 'Show Discrepancies Only'}
                </button>
              </div>

              {/* Checklist data table */}
              <div className="data-table">
                <table style={{ minWidth: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--color-surface-2)' }}>
                      {['Asset Tag','Asset Name','Expected Location','Snapshot Status','Actual Status','Notes', selectedCycle.status !== 'CLOSED' ? '' : null].filter(Boolean).map(h => (
                        <th key={h} className="data-table-header">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {checklist.map(item => (
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

      {/* ── Create Audit Cycle Modal ─────────────────────────────────── */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.70)', backdropFilter: 'blur(4px)', padding: 16 }}>
          <div style={{ position: 'absolute', inset: 0 }} onClick={() => setShowCreateModal(false)} aria-hidden="true" />
          <div style={{ position: 'relative', backgroundColor: 'var(--color-surface-3)', border: '1px solid #34343a', borderRadius: 12, boxShadow: '0 24px 64px rgba(0,0,0,0.60)', width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #23252a' }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-ink)', margin: 0 }}>Initiate Audit Cycle</h3>
              <button onClick={() => setShowCreateModal(false)} className="btn-icon-row" aria-label="Close"><X size={16} /></button>
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 0 }}>
              {formError && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, backgroundColor: 'var(--color-semantic-error-bg)', border: '1px solid var(--color-semantic-error)', borderRadius: 8, padding: '8px 12px', color: 'var(--color-semantic-error)', fontSize: 13, marginBottom: 16 }}>
                  <AlertCircle size={13} style={{ flexShrink: 0, marginTop: 1 }} /><span>{formError}</span>
                </div>
              )}
              <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label className="field-label">Audit Cycle Name *</label>
                  <input type="text" required placeholder="e.g. Q3 2026 Bengaluru HQ Audit" value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })} className="input-field" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="field-label">Auditor *</label>
                    <select required value={formData.auditorId} onChange={e => setFormData({ ...formData, auditorId: e.target.value })} className="input-field">
                      <option value="">Select Auditor…</option>
                      {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="field-label">Department Scope</label>
                    <select value={formData.departmentId} onChange={e => setFormData({ ...formData, departmentId: e.target.value })} className="input-field">
                      <option value="">All Departments</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="field-label">Location Scope (optional)</label>
                  <input type="text" placeholder="e.g. Floor 2" value={formData.locationScope}
                    onChange={e => setFormData({ ...formData, locationScope: e.target.value })} className="input-field" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="field-label">Start Date *</label>
                    <input type="date" required value={formData.startDate}
                      onChange={e => setFormData({ ...formData, startDate: e.target.value })} className="input-field" />
                  </div>
                  <div>
                    <label className="field-label">End Date *</label>
                    <input type="date" required value={formData.endDate}
                      onChange={e => setFormData({ ...formData, endDate: e.target.value })} className="input-field" />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 8, borderTop: '1px solid #23252a' }}>
                  <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">Create Cycle</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
