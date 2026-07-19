import { useState, useEffect } from 'react';
import apiClient from '../../api/authApi';
import useAuth from '../../hooks/useAuth';
import {
  Building2,
  FolderOpen,
  Users,
  Plus,
  Search,
  Loader2,
  AlertCircle,
  X,
  Edit2,
} from 'lucide-react';

// ── Tab definitions ─────────────────────────────────────────────────────────

const TABS = [
  { id: 'departments', label: 'Departments',       icon: Building2 },
  { id: 'categories',  label: 'Categories',        icon: FolderOpen },
  { id: 'employees',   label: 'Employee Directory', icon: Users },
];

// ── Reusable Modal ──────────────────────────────────────────────────────────

/* Dark-canvas ModalOverlay replaces the old white Modal */
function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <>
      <div
        style={{ position: 'fixed', inset: 0, backgroundColor: 'var(--color-semantic-overlay)', backdropFilter: 'blur(4px)', zIndex: 40 }}
        onClick={onClose}
      />
      <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <div style={{ backgroundColor: 'var(--color-surface-3)', border: '1px solid var(--color-hairline-strong)', borderRadius: 12, boxShadow: '0 24px 64px rgba(0,0,0,0.60)', width: '100%', maxWidth: 440, maxHeight: '90vh', overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--color-hairline)' }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-ink)', margin: 0 }}>{title}</h2>
            <button onClick={onClose} className="btn-icon-row" aria-label="Close"><X size={16} /></button>
          </div>
          <div style={{ padding: '20px' }}>{children}</div>
        </div>
      </div>
    </>
  );
}

// ── Departments Tab ─────────────────────────────────────────────────────────

function DepartmentsTab() {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN';

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', headId: '', parentDepartmentId: '' });
  const [submitting, setSubmitting] = useState(false);

  async function fetchDepartments() {
    try {
      setLoading(true);
      const res = await apiClient.get('/departments');
      setDepartments(res.data.data);
    } catch {
      setError('Failed to load departments.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchDepartments(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiClient.post('/departments', {
        name: form.name,
        headId: form.headId || undefined,
        parentDepartmentId: form.parentDepartmentId || undefined,
      });
      setShowModal(false);
      setForm({ name: '', headId: '', parentDepartmentId: '' });
      fetchDepartments();
    } catch (err) {
      setError(err?.response?.data?.error?.message || 'Failed to create department.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <p className="type-body-sm" style={{ color: 'var(--color-ink-subtle)' }}>{departments.length} department(s)</p>
        {isAdmin && (
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus size={14} /> Add Department
          </button>
        )}
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

      <div className="data-table">
        <table style={{ minWidth: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--color-surface-2)' }}>
              {['Name','Head','Parent','Status'].map(h => <th key={h} className="data-table-header">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {departments.map(dept => (
              <tr key={dept.id} className="data-table-row">
                <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 500, color: 'var(--color-ink)' }}>{dept.name}</td>
                <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--color-ink-subtle)' }}>{dept.head?.name || '—'}</td>
                <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--color-ink-subtle)' }}>{dept.parentDepartment?.name || '—'}</td>
                <td style={{ padding: '10px 14px' }}><StatusBadge status={dept.status} /></td>
              </tr>
            ))}
            {departments.length === 0 && (
              <tr><td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: 'var(--color-ink-tertiary)', fontSize: 13 }}>No departments yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Department Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Department">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <InputField label="Department Name *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
          <InputField label="Head User ID" value={form.headId} onChange={(v) => setForm({ ...form, headId: v })} placeholder="UUID (optional)" />
          <InputField label="Parent Dept ID" value={form.parentDepartmentId} onChange={(v) => setForm({ ...form, parentDepartmentId: v })} placeholder="UUID (optional)" />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 8, borderTop: '1px solid var(--color-hairline)' }}>
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ── Categories Tab ──────────────────────────────────────────────────────────

function CategoriesTab() {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN';

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  async function fetchCategories() {
    try {
      setLoading(true);
      const res = await apiClient.get('/categories');
      setCategories(res.data.data);
    } catch {
      setError('Failed to load categories.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchCategories(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiClient.post('/categories', form);
      setShowModal(false);
      setForm({ name: '', description: '' });
      fetchCategories();
    } catch (err) {
      setError(err?.response?.data?.error?.message || 'Failed to create category.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <p className="type-body-sm" style={{ color: 'var(--color-ink-subtle)' }}>{categories.length} category(ies)</p>
        {isAdmin && (
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus size={14} /> Add Category
          </button>
        )}
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
        {categories.map(cat => (
          <div key={cat.id} className="feature-card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 8, backgroundColor: 'var(--color-badge-brand-bg)' }}>
                <FolderOpen size={16} color='var(--color-primary-hover)' />
              </div>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-ink)', margin: 0 }}>{cat.name}</h3>
            </div>
            <p className="type-body-sm" style={{ color: 'var(--color-ink-subtle)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {cat.description || 'No description'}
            </p>
          </div>
        ))}
        {categories.length === 0 && (
          <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--color-ink-tertiary)', padding: '32px 0', fontSize: 13 }}>No categories yet.</p>
        )}
      </div>

      {/* Create Category Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Category">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <InputField label="Category Name *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
          <div>
            <label className="field-label">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="input-field"
              style={{ resize: 'none', height: 'auto' }}
              placeholder="Optional description…"
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 8, borderTop: '1px solid var(--color-hairline)' }}>
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ── Employee Directory Tab ──────────────────────────────────────────────────

function EmployeesTab() {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN';

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  
  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({ role: '', status: '' });
  const [isUpdating, setIsUpdating] = useState(false);

  function openEditModal(user) {
    setSelectedUser(user);
    setEditForm({ role: user.role, status: user.status });
    setShowEditModal(true);
  }

  async function handleUpdateUser(e) {
    e.preventDefault();
    if (!selectedUser) return;
    setIsUpdating(true);
    setError('');
    
    try {
      // Update role if changed
      if (editForm.role !== selectedUser.role) {
        await apiClient.patch(`/users/${selectedUser.id}/role`, { role: editForm.role });
      }
      // Update status if changed
      if (editForm.status !== selectedUser.status) {
        await apiClient.patch(`/users/${selectedUser.id}/status`, { status: editForm.status });
      }
      
      setShowEditModal(false);
      fetchUsers(); // refresh the list
    } catch (err) {
      setError(err?.response?.data?.error?.message || 'Failed to update user.');
    } finally {
      setIsUpdating(false);
    }
  }

  async function fetchUsers() {
    try {
      setLoading(true);
      const res = await apiClient.get('/users');
      setUsers(res.data.data);
    } catch (err) {
      if (err?.response?.status === 403) {
        setError('Only administrators can view the employee directory.');
      } else {
        setError('Failed to load users.');
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchUsers(); }, []);

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorBanner message={error} />;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200, maxWidth: 360 }}>
          <Search size={14} color='var(--color-ink-tertiary)' style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field"
            style={{ paddingLeft: 32 }}
          />
        </div>
        <p className="type-body-sm" style={{ color: 'var(--color-ink-subtle)' }}>{filteredUsers.length} user(s)</p>
      </div>

      <div className="data-table">
        <table style={{ minWidth: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--color-surface-2)' }}>
              {['Name','Email','Department','Role','Status', isAdmin ? 'Actions' : null].filter(Boolean).map(h => <th key={h} className="data-table-header">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} className="data-table-row">
                <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 500, color: 'var(--color-ink)' }}>{user.name}</td>
                <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--color-ink-subtle)' }}>{user.email}</td>
                <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--color-ink-subtle)' }}>{user.department?.name || '—'}</td>
                <td style={{ padding: '10px 14px' }}><RoleBadge role={user.role} /></td>
                <td style={{ padding: '10px 14px' }}><StatusBadge status={user.status} /></td>
                {isAdmin && (
                  <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                    {user.id !== currentUser?.id && (
                      <button onClick={() => openEditModal(user)} className="btn-icon-row" title="Edit Role & Status">
                        <Edit2 size={13} />
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr><td colSpan={isAdmin ? 6 : 5} style={{ padding: '32px', textAlign: 'center', color: 'var(--color-ink-tertiary)', fontSize: 13 }}>No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Employee Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Employee">
        {selectedUser && (
          <form onSubmit={handleUpdateUser} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="field-label">Name</label>
              <input type="text" value={selectedUser.name} disabled className="input-field" style={{ opacity: 0.5, cursor: 'not-allowed' }} />
            </div>
            <div>
              <label className="field-label">Role</label>
              <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} className="input-field">
                <option value="EMPLOYEE">Employee</option>
                <option value="ASSET_MANAGER">Asset Manager</option>
                <option value="DEPARTMENT_HEAD">Department Head</option>
              </select>
            </div>
            <div>
              <label className="field-label">Status</label>
              <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className="input-field">
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 8, borderTop: '1px solid var(--color-hairline)' }}>
              <button type="button" onClick={() => setShowEditModal(false)} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={isUpdating || (editForm.role === selectedUser.role && editForm.status === selectedUser.status)} className="btn-primary">
                {isUpdating ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

// ── Shared Micro-Components ─────────────────────────────────────────────────

function LoadingSpinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0' }}>
      <Loader2 size={22} color='var(--color-primary)' style={{ animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function ErrorBanner({ message, onDismiss }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, borderRadius: 8, border: '1px solid var(--color-semantic-error)', backgroundColor: 'var(--color-semantic-error-bg)', padding: '10px 12px', marginBottom: 16, color: 'var(--color-semantic-error)', fontSize: 13 }}>
      <AlertCircle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
      <span style={{ flex: 1 }}>{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} style={{ color: 'var(--color-semantic-error)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <X size={13} />
        </button>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = status === 'ACTIVE'
    ? { bg: 'var(--color-status-available-bg)', color: 'var(--color-status-available)' }
    : { bg: 'var(--color-status-disposed-bg)', color: 'var(--color-status-disposed)' };
  return <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 9999, backgroundColor: cfg.bg, color: cfg.color }}>{status}</span>;
}

function RoleBadge({ role }) {
  const map = {
    ADMIN:           { bg: 'var(--color-semantic-error-bg)',    color: 'var(--color-semantic-error)' },
    ASSET_MANAGER:   { bg: 'var(--color-status-allocated-bg)',   color: 'var(--color-status-allocated)' },
    DEPARTMENT_HEAD: { bg: 'var(--color-status-maintenance-bg)',   color: 'var(--color-status-maintenance)' },
    EMPLOYEE:        { bg: 'var(--color-status-available-bg)',    color: 'var(--color-status-available)' },
  };
  const cfg = map[role] || { bg: 'var(--color-status-disposed-bg)', color: 'var(--color-status-disposed)' };
  return <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 9999, backgroundColor: cfg.bg, color: cfg.color }}>{role?.replace('_', ' ')}</span>;
}

function InputField({ label, value, onChange, placeholder, required }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="input-field"
      />
    </div>
  );
}

// ── Main Page Component ─────────────────────────────────────────────────────

export default function OrganizationSetupPage() {
  const [activeTab, setActiveTab] = useState('departments');

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <h1 className="type-display-md" style={{ color: 'var(--color-ink)', margin: 0 }}>Organization Setup</h1>
        <p className="type-body-sm" style={{ color: 'var(--color-ink-subtle)', marginTop: 6 }}>Manage departments, asset categories, and the employee directory.</p>
      </div>

      {/* Tab bar */}
      <div style={{ borderBottom: '1px solid var(--color-hairline)', marginBottom: 24 }}>
        <nav style={{ display: 'flex', gap: 0 }}>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 16px',
                fontSize: 13, fontWeight: activeTab === id ? 600 : 400,
                color: activeTab === id ? 'var(--color-ink)' : 'var(--color-ink-subtle)',
                background: 'transparent', border: 'none',
                borderBottom: `2px solid ${activeTab === id ? 'var(--color-primary)' : 'transparent'}`,
                cursor: 'pointer',
                transition: 'color var(--duration-fast) var(--ease-standard)',
              }}
              aria-selected={activeTab === id}
            >
              <Icon size={14} />{label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === 'departments' && <DepartmentsTab />}
      {activeTab === 'categories'  && <CategoriesTab />}
      {activeTab === 'employees'   && <EmployeesTab />}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
