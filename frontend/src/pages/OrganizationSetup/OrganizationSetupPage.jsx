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

function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="px-6 py-4">{children}</div>
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
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">{departments.length} department(s)</p>
        {isAdmin && (
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus className="h-4 w-4" /> Add Department
          </button>
        )}
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-3 font-medium text-slate-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Head</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Parent</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {departments.map((dept) => (
              <tr key={dept.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-900">{dept.name}</td>
                <td className="px-4 py-3 text-slate-600">{dept.head?.name || '—'}</td>
                <td className="px-4 py-3 text-slate-600">{dept.parentDepartment?.name || '—'}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={dept.status} />
                </td>
              </tr>
            ))}
            {departments.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">No departments yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Department Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Department">
        <form onSubmit={handleCreate} className="space-y-4">
          <InputField label="Department Name *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
          <InputField label="Head User ID" value={form.headId} onChange={(v) => setForm({ ...form, headId: v })} placeholder="UUID (optional)" />
          <InputField label="Parent Dept ID" value={form.parentDepartmentId} onChange={(v) => setForm({ ...form, parentDepartmentId: v })} placeholder="UUID (optional)" />
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create'}
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
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">{categories.length} category(ies)</p>
        {isAdmin && (
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus className="h-4 w-4" /> Add Category
          </button>
        )}
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600">
                <FolderOpen className="h-5 w-5" />
              </div>
              <h3 className="font-medium text-slate-900">{cat.name}</h3>
            </div>
            <p className="text-sm text-slate-500 line-clamp-2">{cat.description || 'No description'}</p>
          </div>
        ))}
        {categories.length === 0 && (
          <p className="col-span-full text-center text-slate-400 py-8">No categories yet.</p>
        )}
      </div>

      {/* Create Category Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Category">
        <form onSubmit={handleCreate} className="space-y-4">
          <InputField label="Category Name *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              placeholder="Optional description…"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create'}
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
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-md border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>
        <p className="text-sm text-slate-500">{filteredUsers.length} user(s)</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-3 font-medium text-slate-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Email</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Department</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Role</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
              {isAdmin && <th className="text-right px-4 py-3 font-medium text-slate-600">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-900">{user.name}</td>
                <td className="px-4 py-3 text-slate-600">{user.email}</td>
                <td className="px-4 py-3 text-slate-600">{user.department?.name || '—'}</td>
                <td className="px-4 py-3">
                  <RoleBadge role={user.role} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={user.status} />
                </td>
                {isAdmin && (
                  <td className="px-4 py-3 text-right">
                    {/* Don't allow admin to demote themselves easily here to prevent lockout */}
                    {user.id !== currentUser?.id && (
                      <button
                        onClick={() => openEditModal(user)}
                        className="text-slate-400 hover:text-indigo-600 transition-colors"
                        title="Edit Role & Status"
                      >
                        <Edit2 className="h-4 w-4 inline-block" />
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr><td colSpan={isAdmin ? 6 : 5} className="px-4 py-8 text-center text-slate-400">No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Employee Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Employee">
        {selectedUser && (
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
              <input type="text" value={selectedUser.name} disabled className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm bg-slate-50 text-slate-500 outline-none cursor-not-allowed" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
              <select
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
              >
                <option value="EMPLOYEE">Employee</option>
                <option value="ASSET_MANAGER">Asset Manager</option>
                <option value="DEPARTMENT_HEAD">Department Head</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowEditModal(false)} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={isUpdating || (editForm.role === selectedUser.role && editForm.status === selectedUser.status)} className="btn-primary">
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
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
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-6 w-6 text-indigo-600 animate-spin" />
    </div>
  );
}

function ErrorBanner({ message, onDismiss }) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 mb-4 text-sm text-red-700">
      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="text-red-400 hover:text-red-600">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = status === 'ACTIVE'
    ? 'bg-green-100 text-green-700'
    : 'bg-slate-100 text-slate-600';
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors}`}>{status}</span>;
}

function RoleBadge({ role }) {
  const colors = {
    ADMIN: 'bg-red-100 text-red-700',
    ASSET_MANAGER: 'bg-blue-100 text-blue-700',
    DEPARTMENT_HEAD: 'bg-amber-100 text-amber-700',
    EMPLOYEE: 'bg-green-100 text-green-700',
  };
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors[role] || 'bg-slate-100 text-slate-600'}`}>{role?.replace('_', ' ')}</span>;
}

function InputField({ label, value, onChange, placeholder, required }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
      />
    </div>
  );
}

// ── Main Page Component ─────────────────────────────────────────────────────

export default function OrganizationSetupPage() {
  const [activeTab, setActiveTab] = useState('departments');

  return (
    <div>
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Organization Setup</h1>
        <p className="mt-1 text-sm text-slate-500">Manage departments, asset categories, and the employee directory.</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 mb-6">
        <nav className="flex gap-6">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={[
                'flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors',
                activeTab === id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300',
              ].join(' ')}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'departments' && <DepartmentsTab />}
      {activeTab === 'categories' && <CategoriesTab />}
      {activeTab === 'employees' && <EmployeesTab />}
    </div>
  );
}
