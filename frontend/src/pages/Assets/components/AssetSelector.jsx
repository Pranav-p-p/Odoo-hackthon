import { useState, useEffect, useRef } from 'react';
import { Package, ChevronDown, Loader2 } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { getAssets } from '../../../api/assetApi';

export default function AssetSelector({ value, onChange, filterBookable = false }) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    async function fetchAssets() {
      setLoading(true);
      try {
        const params = {};
        if (filterBookable) params.isBookable = true;
        const res = await getAssets(params);
        // API_CONTRACT paginated shape: { success, data: [...], pagination }
        const raw = res.data?.data ?? res.data ?? [];
        setAssets(Array.isArray(raw) ? raw : raw.items ?? []);
      } catch (_e) {
        setAssets([]);
      } finally {
        setLoading(false);
      }
    }
    fetchAssets();
  }, [filterBookable]);

  // Keep search input synced with value
  useEffect(() => {
    if (value) {
      setSearch(value.name || value.assetTag || '');
    } else {
      setSearch('');
    }
  }, [value]);

  const filteredAssets = assets.filter(a =>
    !search ||
    (a.name && a.name.toLowerCase().includes(search.toLowerCase())) ||
    (a.assetTag && a.assetTag.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <Package className="absolute left-3 top-2.5 h-4 w-4 pointer-events-none" style={{ color: 'var(--color-ink-tertiary)' }} />
        <input
          type="text"
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setOpen(true);
            if (value) onChange(null); // Clear selection if typing
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search by name or asset tag…"
          className="input-field text-sm" style={{ paddingLeft: 36, paddingRight: 36 }}
        />
        {loading ? (
          <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin pointer-events-none" style={{ color: 'var(--color-ink-tertiary)' }} />
        ) : (
          <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 pointer-events-none" style={{ color: 'var(--color-ink-tertiary)' }} />
        )}
      </div>

      {open && filteredAssets.length > 0 && (
        <ul className="menu-surface absolute z-20 mt-1 w-full rounded-md shadow-lg max-h-52 overflow-y-auto text-sm">
          {filteredAssets.slice(0, 50).map(a => (
            <li
              key={a.id}
              onClick={() => {
                onChange(a);
                setSearch(a.name);
                setOpen(false);
              }}
              className="menu-item flex items-center justify-between gap-2 px-3 py-2 cursor-pointer transition-colors"
            >
              <div>
                <span className="font-medium" style={{ color: 'var(--color-ink)' }}>{a.name}</span>
                <span className="ml-2 font-mono text-xs" style={{ color: 'var(--color-ink-tertiary)' }}>{a.assetTag}</span>
              </div>
              <StatusBadge type="asset" status={a.status} />
            </li>
          ))}
        </ul>
      )}
      
      {open && filteredAssets.length === 0 && !loading && (
        <div className="menu-surface absolute z-20 mt-1 w-full rounded-md shadow-lg p-3 text-sm text-center" style={{ color: 'var(--color-ink-subtle)' }}>
          No assets found.
        </div>
      )}
    </div>
  );
}
