import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Plus, SlidersHorizontal, AlertCircle,
  Loader2, Package, ChevronLeft, ChevronRight, X,
  ExternalLink, BookOpen,
} from 'lucide-react';
import { getAssets, getCategories, getDepartments } from '../../api/assetApi';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import StatusBadge from './components/StatusBadge';

// ─── Constants (exact enum values from SHARED_ENUMS.md) ──────────────────────
const ASSET_STATUSES = [
  'AVAILABLE', 'ALLOCATED', 'RESERVED',
  'UNDER_MAINTENANCE', 'LOST', 'RETIRED', 'DISPOSED',
];

const STATUS_LABELS = {
  AVAILABLE: 'Available', ALLOCATED: 'Allocated', RESERVED: 'Reserved',
  UNDER_MAINTENANCE: 'Under Maintenance', LOST: 'Lost',
  RETIRED: 'Retired', DISPOSED: 'Disposed',
};

const PAGE_SIZE = 20;

// ─── Small shared helpers ─────────────────────────────────────────────────────
function SelectFilter({ id, label, value, onChange, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="sr-only">{label}</label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none min-w-[140px]"
      >
        {children}
      </select>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
/**
 * AssetDirectory — Screen 4 (Asset Core, Member 2)
 *
 * GET /api/v1/assets — paginated, filterable by status/category/department/location, searchable.
 * Table columns: Tag | Name | Category | Status | Department | Location | Bookable
 * Clicking a row navigates to /assets/:id (detail — coming later).
 * "+ Register Asset" button gated to ASSET_MANAGER role.
 */
export default function AssetDirectory() {
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const isAssetManager = user?.role === 'ASSET_MANAGER' || user?.role === 'ADMIN';

  // ── Filter state ─────────────────────────────────────────────────────────────
  const [search, setSearch]           = useState('');
  const [filterStatus, setFilterStatus]     = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDept, setFilterDept]         = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [page, setPage]               = useState(1);

  // ── Dropdown data ─────────────────────────────────────────────────────────────
  const [categories, setCategories]   = useState([]);
  const [departments, setDepartments] = useState([]);

  // ── Assets data ───────────────────────────────────────────────────────────────
  const [assets, setAssets]       = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0 });
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  // Debounce search
  const searchTimer = useRef(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(searchTimer.current);
  }, [search]);

  // ── Load dropdown data once ──────────────────────────────────────────────────
  useEffect(() => {
    async function loadDropdowns() {
      try {
        const [catRes, deptRes] = await Promise.all([
          getCategories(),
          getDepartments({ status: 'ACTIVE' }),
        ]);
        const cats  = catRes.data?.data  ?? catRes.data  ?? [];
        const depts = deptRes.data?.data ?? deptRes.data ?? [];
        setCategories(Array.isArray(cats) ? cats : []);
        setDepartments(Array.isArray(depts) ? depts : []);
      } catch {
        // Non-fatal — filters just won't have options
      }
    }
    loadDropdowns();
  }, []);

  // ── Fetch assets whenever filters/page change ────────────────────────────────
  const fetchAssets = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const queryParams = {
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
        status: filterStatus || undefined,
        categoryId: filterCategory || undefined,
        departmentId: filterDept || undefined,
        location: filterLocation || undefined,
      };

      const res = await getAssets(queryParams);
      // paginated envelope: { success, data: [], pagination: {...} }
      // or plain: { success, data: [] }
      const data = Array.isArray(res.data?.data) ? res.data.data :
                   Array.isArray(res.data)        ? res.data : [];
      const pag  = res.data?.pagination ?? { page: 1, limit: PAGE_SIZE, total: data.length };
      setAssets(data);
      setPagination(pag);
    } catch (err) {
      const msg = err?.response?.data?.error?.message || err?.response?.data?.message;
      if (!err?.response) {
        setError('Cannot reach the server. Is the backend running?');
      } else {
        setError(msg || 'Failed to load assets.');
      }
      setAssets([]);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, filterStatus, filterCategory, filterDept, filterLocation]);

  useEffect(() => { fetchAssets(); }, [fetchAssets]);

  // ── Reset page when filters change ───────────────────────────────────────────
  function resetPage() { setPage(1); }
  function clearFilters() {
    setSearch('');
    setFilterStatus('');
    setFilterCategory('');
    setFilterDept('');
    setFilterLocation('');
    setPage(1);
  }

  const hasFilters = search || filterStatus || filterCategory || filterDept || filterLocation;
  const totalPages = Math.ceil(pagination.total / PAGE_SIZE) || 1;

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Package className="h-5 w-5 text-indigo-600" aria-hidden="true" />
            <div>
              <h1 className="text-lg font-semibold text-slate-900">Asset Directory</h1>
              <p className="text-xs text-slate-500">
                {pagination.total > 0
                  ? `${pagination.total} asset${pagination.total !== 1 ? 's' : ''} total`
                  : 'All registered assets'}
              </p>
            </div>
          </div>

          {/* Register button — ASSET_MANAGER only */}
          {isAssetManager && (
            <button
              id="register-asset-btn"
              onClick={() => navigate('/assets/new')}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 transition-colors"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Register Asset
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-4">
        {/* ── Filters row ────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-end gap-3">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="asset-search" className="sr-only">Search assets</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                id="asset-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by tag, name, or serial…"
                className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-300 rounded-md bg-white outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Status filter */}
          <SelectFilter id="filter-status" label="Status" value={filterStatus} onChange={(v) => { setFilterStatus(v); resetPage(); }}>
            <option value="">All statuses</option>
            {ASSET_STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </SelectFilter>

          {/* Category filter */}
          <SelectFilter id="filter-category" label="Category" value={filterCategory} onChange={(v) => { setFilterCategory(v); resetPage(); }}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </SelectFilter>

          {/* Department filter */}
          <SelectFilter id="filter-dept" label="Department" value={filterDept} onChange={(v) => { setFilterDept(v); resetPage(); }}>
            <option value="">All departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </SelectFilter>

          {/* Clear filters */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 border border-slate-300 rounded-md bg-white hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-indigo-500 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </button>
          )}

          {/* Filters icon for visual polish */}
          <SlidersHorizontal className="h-4 w-4 text-slate-400 self-center" aria-hidden="true" />
        </div>

        {/* ── Error state ──────────────────────────────────────────────────────── */}
        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ── Table ─────────────────────────────────────────────────────────── */}
        <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-sm" aria-label="Asset directory">
              <thead>
                <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  <th className="px-4 py-3 w-28">Tag</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3 text-center">Bookable</th>
                  <th className="px-4 py-3 w-10">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {/* Loading state */}
                {loading && (
                  <tr>
                    <td colSpan={8} className="py-16 text-center">
                      <Loader2 className="h-6 w-6 animate-spin text-indigo-500 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">Loading assets…</p>
                    </td>
                  </tr>
                )}

                {/* Empty state */}
                {!loading && assets.length === 0 && !error && (
                  <tr>
                    <td colSpan={8} className="py-16 text-center">
                      <Package className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                      {hasFilters ? (
                        <>
                          <p className="text-sm font-medium text-slate-600">No assets match your filters.</p>
                          <button
                            onClick={clearFilters}
                            className="mt-2 text-sm text-indigo-600 hover:underline"
                          >
                            Clear filters
                          </button>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-slate-600">No assets registered yet.</p>
                          {isAssetManager && (
                            <button
                              onClick={() => navigate('/assets/new')}
                              className="mt-2 text-sm text-indigo-600 hover:underline"
                            >
                              Register the first asset →
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                )}

                {/* Data rows */}
                {!loading && assets.map((asset) => (
                  <tr
                    key={asset.id}
                    onClick={() => navigate(`/assets/${asset.id}`)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors group"
                    tabIndex={0}
                    role="button"
                    aria-label={`View asset ${asset.assetTag} — ${asset.name}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') navigate(`/assets/${asset.id}`);
                    }}
                  >
                    {/* Asset Tag */}
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                        {asset.assetTag}
                      </span>
                    </td>

                    {/* Name */}
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800 group-hover:text-indigo-700 transition-colors">
                        {asset.name}
                      </div>
                      {asset.serialNumber && (
                        <div className="text-xs text-slate-400 mt-0.5">{asset.serialNumber}</div>
                      )}
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3 text-slate-600">
                      {asset.category?.name ?? '—'}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <StatusBadge status={asset.status} />
                    </td>

                    {/* Department */}
                    <td className="px-4 py-3 text-slate-600">
                      {asset.department?.name ?? <span className="text-slate-300">—</span>}
                    </td>

                    {/* Location */}
                    <td className="px-4 py-3 text-slate-600">
                      {asset.location ?? <span className="text-slate-300">—</span>}
                    </td>

                    {/* Bookable */}
                    <td className="px-4 py-3 text-center">
                      {asset.isBookable ? (
                        <span title="Bookable resource" className="inline-flex items-center gap-1 text-xs text-indigo-600">
                          <BookOpen className="h-3.5 w-3.5" />
                          Yes
                        </span>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>

                    {/* Detail link icon */}
                    <td className="px-4 py-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ─────────────────────────────────────────────────── */}
          {!loading && assets.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 bg-slate-50 text-sm text-slate-600">
              <span>
                Showing {(pagination.page - 1) * pagination.limit + 1}–
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-1 rounded hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-1 text-xs">
                  Page {pagination.page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="p-1 rounded hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
