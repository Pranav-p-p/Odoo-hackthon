import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Plus, SlidersHorizontal, AlertCircle,
  Loader2, Package, ChevronLeft, ChevronRight, X,
  ExternalLink, BookOpen,
} from 'lucide-react';
import { getAssets, getCategories, getDepartments } from '../../api/assetApi';
import useAuth from '../../hooks/useAuth';
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label htmlFor={id} className="sr-only">{label}</label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          borderRadius:    8,
          border:          '1px solid #23252a',
          backgroundColor: 'var(--color-surface-1)',
          color:           'var(--color-ink)',
          padding:         '6px 12px',
          fontSize:        13,
          outline:         'none',
          minWidth:        140,
          cursor:          'pointer',
        }}
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
  const { currentUser: user } = useAuth();
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
    <div style={{ maxWidth: 1280, margin: '0 auto' }}>
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Package size={18} color='var(--color-primary)' aria-hidden="true" />
          <div>
            <h1 className="type-display-md" style={{ color: 'var(--color-ink)', margin: 0 }}>Asset Directory</h1>
            <p className="type-body-sm" style={{ color: 'var(--color-ink-subtle)', marginTop: 4 }}>
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
            className="btn-primary"
            style={{ flexShrink: 0 }}
          >
            <Plus size={14} aria-hidden="true" />
            Register Asset
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* ── Filters / sticky filter bar ──────────────────────────────────── */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
          {/* Search */}
          <div style={{ flex: '1 1 200px', position: 'relative' }}>
            <label htmlFor="asset-search" className="sr-only">Search assets</label>
            <Search size={14} color='var(--color-ink-tertiary)' style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              id="asset-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by tag, name, or serial…"
              className="input-field"
              style={{ paddingLeft: 32 }}
            />
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
            <button onClick={clearFilters} className="btn-secondary" style={{ padding: '6px 12px', height: 'auto' }}>
              <X size={13} />
              Clear
            </button>
          )}

          <SlidersHorizontal size={14} color='var(--color-ink-subtle)' aria-hidden="true" />
        </div>

        {/* ── Error state ──────────────────────────────────────────────────────── */}
        {error && (
          <div
            role="alert"
            aria-live="polite"
            style={{ display: 'flex', alignItems: 'flex-start', gap: 10, backgroundColor: 'var(--color-semantic-error-bg)', border: '1px solid var(--color-semantic-error)', borderRadius: 8, padding: '10px 14px', color: 'var(--color-semantic-error)', fontSize: 13 }}
          >
            <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{error}</span>
          </div>
        )}

        {/* ── Table ─────────────────────────────────────────────────────────── */}
        <div className="data-table">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ minWidth: '100%', borderCollapse: 'collapse' }} aria-label="Asset directory">
              <thead>
                <tr style={{ backgroundColor: 'var(--color-surface-2)' }}>
                  {['Tag','Name','Category','Status','Department','Location','Bookable',''].map((h, i) => (
                    <th key={i} className="data-table-header" style={{ textAlign: i === 6 ? 'center' : 'left', width: i === 7 ? 40 : undefined }}>
                      {h || <span className="sr-only">Actions</span>}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {/* Loading state */}
                {loading && (
                  <tr>
                    <td colSpan={8} style={{ padding: '48px 16px', textAlign: 'center' }}>
                      <Loader2 size={22} color='var(--color-primary)' style={{ animation: 'spin 1s linear infinite', margin: '0 auto 8px' }} />
                      <p className="type-body-sm" style={{ color: 'var(--color-ink-subtle)' }}>Loading assets…</p>
                    </td>
                  </tr>
                )}

                {/* Empty state */}
                {!loading && assets.length === 0 && !error && (
                  <tr>
                    <td colSpan={8} style={{ padding: '48px 16px', textAlign: 'center' }}>
                      <Package size={32} color='var(--color-hairline-tertiary)' style={{ margin: '0 auto 12px' }} />
                      {hasFilters ? (
                        <>
                          <p className="type-body-sm" style={{ color: 'var(--color-ink-subtle)' }}>No assets match your filters.</p>
                          <button onClick={clearFilters} className="text-link" style={{ marginTop: 8, fontSize: 13 }}>Clear filters</button>
                        </>
                      ) : (
                        <>
                          <p className="type-body-sm" style={{ color: 'var(--color-ink-subtle)' }}>No assets registered yet.</p>
                          {isAssetManager && (
                            <button onClick={() => navigate('/assets/new')} className="text-link" style={{ marginTop: 8, fontSize: 13 }}>Register the first asset →</button>
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
                    className="data-table-row"
                    tabIndex={0}
                    role="button"
                    style={{ cursor: 'pointer' }}
                    aria-label={`View asset ${asset.assetTag} — ${asset.name}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') navigate(`/assets/${asset.id}`);
                    }}
                  >
                    {/* Asset Tag — mono font per DESIGN.md */}
                    <td style={{ padding: '12px 16px' }}>
                      <span className="type-mono" style={{ color: 'var(--color-ink-subtle)', backgroundColor: 'var(--color-surface-2)', padding: '2px 6px', borderRadius: 4 }}>
                        {asset.assetTag}
                      </span>
                    </td>

                    {/* Name */}
                    <td style={{ padding: '12px 16px' }}>
                      <p style={{ fontWeight: 500, fontSize: 13, color: 'var(--color-ink)', margin: 0 }}>{asset.name}</p>
                      {asset.serialNumber && (
                        <p className="type-mono" style={{ color: 'var(--color-ink-tertiary)', marginTop: 2 }}>{asset.serialNumber}</p>
                      )}
                    </td>

                    {/* Category */}
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--color-ink-muted)' }}>
                      {asset.category?.name ?? <span style={{ color: 'var(--color-hairline-tertiary)' }}>—</span>}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '12px 16px' }}>
                      <StatusBadge status={asset.status} />
                    </td>

                    {/* Department */}
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--color-ink-muted)' }}>
                      {asset.department?.name ?? <span style={{ color: 'var(--color-hairline-tertiary)' }}>—</span>}
                    </td>

                    {/* Location */}
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--color-ink-muted)' }}>
                      {asset.location ?? <span style={{ color: 'var(--color-hairline-tertiary)' }}>—</span>}
                    </td>

                    {/* Bookable */}
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      {asset.isBookable ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--color-primary)' }}>
                          <BookOpen size={12} />
                          Yes
                        </span>
                      ) : (
                        <span style={{ fontSize: 12, color: 'var(--color-hairline-tertiary)' }}>—</span>
                      )}
                    </td>

                    {/* Detail icon */}
                    <td style={{ padding: '12px 16px', color: 'var(--color-ink-tertiary)' }}>
                      <ExternalLink size={13} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ─────────────────────────────────────────────────── */}
          {!loading && assets.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #23252a', padding: '10px 16px', backgroundColor: 'var(--color-surface-1)' }}>
              <span className="type-caption" style={{ color: 'var(--color-ink-subtle)' }}>
                Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="btn-icon-row"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="type-caption" style={{ color: 'var(--color-ink-subtle)' }}>
                  {pagination.page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="btn-icon-row"
                  aria-label="Next page"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
