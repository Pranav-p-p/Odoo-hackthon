import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, LayoutDashboard, Building2, Package, ArrowLeftRight, CalendarClock,
  Wrench, ClipboardCheck, BarChart3, Bell, Plus,
} from 'lucide-react';

/* Nav destinations surfaced in the palette (mirrors DashboardLayout.Nav_SECTIONS) */
const ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, hint: 'G D' },
  { label: 'Organization', path: '/organization', icon: Building2 },
  { label: 'Asset Directory', path: '/assets', icon: Package, hint: 'G A' },
  { label: 'Register Asset', path: '/assets/new', icon: Plus, hint: 'G N' },
  { label: 'Allocations', path: '/allocations', icon: ArrowLeftRight },
  { label: 'Bookings', path: '/bookings', icon: CalendarClock },
  { label: 'Maintenance', path: '/maintenance', icon: Wrench },
  { label: 'Audits', path: '/audits', icon: ClipboardCheck },
  { label: 'Reports', path: '/reports', icon: BarChart3 },
  { label: 'Notifications', path: '/notifications', icon: Bell },
];

/**
 * Command palette (Ctrl/Cmd+K). Uses the shared .command-palette class.
 * Keyboard: ↑/↓ move, Enter opens, Esc closes, type to filter.
 */
export default function CommandPalette({ open, onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const results = ITEMS.filter((i) =>
    i.label.toLowerCase().includes(query.trim().toLowerCase())
  );

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      const t = setTimeout(() => inputRef.current?.focus(), 20);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => { setActive(0); }, [query]);

  if (!open) return null;

  function go(item) {
    if (!item) return;
    onClose();
    navigate(item.path);
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go(results[active]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  }

  return (
    <div
      className="modal-backdrop"
      style={{ padding: 16 }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="command-palette" role="dialog" aria-modal="true" aria-label="Command palette">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderBottom: '1px solid var(--color-hairline)' }}>
          <Search size={16} color="var(--color-ink-subtle)" aria-hidden="true" />
          <input
            ref={inputRef}
            className="cp-input"
            style={{ border: 'none', background: 'transparent', height: 32, padding: 0 }}
            placeholder="Go to…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            aria-label="Search commands"
          />
        </div>

        <div ref={listRef} style={{ maxHeight: 320, overflowY: 'auto', padding: 6 }}>
          {results.length === 0 && <div className="cp-empty">No matching pages</div>}
          {results.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={item.path}
                className={`cp-item ${i === active ? 'active' : ''}`}
                onMouseEnter={() => setActive(i)}
                onClick={() => go(item)}
              >
                <Icon size={16} aria-hidden="true" />
                <span>{item.label}</span>
                {item.hint && <span className="cp-hint">{item.hint}</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
