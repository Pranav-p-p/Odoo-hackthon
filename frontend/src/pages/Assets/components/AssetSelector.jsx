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
      } catch (e) {
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
        <Package className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
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
          className="w-full border border-slate-300 rounded-md pl-9 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {loading ? (
          <Loader2 className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 animate-spin pointer-events-none" />
        ) : (
          <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
        )}
      </div>

      {open && filteredAssets.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg max-h-52 overflow-y-auto text-sm">
          {filteredAssets.slice(0, 50).map(a => (
            <li
              key={a.id}
              onClick={() => {
                onChange(a);
                setSearch(a.name);
                setOpen(false);
              }}
              className="flex items-center justify-between gap-2 px-3 py-2 hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <div>
                <span className="font-medium text-slate-800">{a.name}</span>
                <span className="ml-2 font-mono text-xs text-slate-400">{a.assetTag}</span>
              </div>
              <StatusBadge type="asset" status={a.status} />
            </li>
          ))}
        </ul>
      )}
      
      {open && filteredAssets.length === 0 && !loading && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg p-3 text-sm text-center text-slate-500">
          No assets found.
        </div>
      )}
    </div>
  );
}
