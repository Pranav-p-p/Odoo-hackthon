import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  CalendarClock,
  Wrench,
  ClipboardCheck,
  BarChart3,
  Bell,
  Building2,
  LogOut,
  Menu,
  X,
  Search,
  ChevronDown,
  User,
} from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

/* ─────────────────────────────────────────────────────────────────────────────
   Sidebar navigation — grouped by section (DESIGN.md §Navigation → sidebar-nav)
   Section labels use type-eyebrow; items use nav-item + active state
───────────────────────────────────────────────────────────────────────────── */
const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard',    path: '/dashboard',    icon: LayoutDashboard },
      { label: 'Organization', path: '/organization', icon: Building2 },
    ],
  },
  {
    label: 'Assets',
    items: [
      { label: 'Assets',       path: '/assets',       icon: Package },
      { label: 'Allocations',  path: '/allocations',  icon: ArrowLeftRight },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Bookings',     path: '/bookings',     icon: CalendarClock },
      { label: 'Maintenance',  path: '/maintenance',  icon: Wrench },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { label: 'Audits',       path: '/audits',       icon: ClipboardCheck },
      { label: 'Reports',      path: '/reports',      icon: BarChart3 },
      { label: 'Notifications',path: '/notifications',icon: Bell },
    ],
  },
];

/* Role display map — semantic spectrum fills at ~14% alpha */
const ROLE_LABEL = {
  ADMIN:          'Admin',
  ASSET_MANAGER:  'Asset Manager',
  DEPARTMENT_HEAD:'Dept. Head',
  EMPLOYEE:       'Employee',
};
const ROLE_BADGE = {
  ADMIN:          'badge-error',
  ASSET_MANAGER:  'badge-info',
  DEPARTMENT_HEAD:'badge-warning',
  EMPLOYEE:       'badge-success',
};

/* Build a breadcrumb label from the pathname */
function useBreadcrumb() {
  const { pathname } = useLocation();
  const parts = pathname.replace(/^\//, '').split('/');
  return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' / ') || 'Dashboard';
}

/* ─────────────────────────────────────────────────────────────────────────────
   DashboardLayout
   Shell: fixed sidebar (240px) + sticky top-nav (56px) + scrollable main
───────────────────────────────────────────────────────────────────────────── */
export default function DashboardLayout() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const breadcrumb = useBreadcrumb();

  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [profileOpen, setProfileOpen]   = useState(false);

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  const roleLabel = ROLE_LABEL[currentUser?.role] ?? 'User';
  const roleBadge = ROLE_BADGE[currentUser?.role] ?? 'badge';
  const initials  = currentUser?.name?.charAt(0)?.toUpperCase() ?? '?';

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: 'var(--color-canvas)' }}>

      {/* ── Mobile overlay ────────────────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.72)',
            zIndex: 40,
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <aside
        style={{
          position:        'fixed',
          top:             0,
          bottom:          0,
          left:            sidebarOpen ? 0 : undefined,
          width:           240,
          backgroundColor: 'var(--color-canvas)',           /* canvas */
          borderRight:     '1px solid #23252a', /* hairline */
          display:         'flex',
          flexDirection:   'column',
          zIndex:          50,
          transform:       undefined,
          flexShrink:      0,
        }}
        className={[
          'af-sidebar',
          sidebarOpen ? 'af-sidebar--open' : '',
        ].join(' ')}
      >
        {/* ── Brand mark ──────────────────────────────────────────────────── */}
        <div style={{
          display:       'flex',
          alignItems:    'center',
          gap:           10,
          padding:       '0 16px',
          height:        56,
          borderBottom:  '1px solid #23252a',
          flexShrink:    0,
        }}>
          {/* Lavender glyph mark */}
          <div style={{
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
            width:           28,
            height:          28,
            borderRadius:    6,
            backgroundColor: 'var(--color-primary)',
            flexShrink:      0,
          }}>
            <svg viewBox="0 0 16 16" fill="none" width={14} height={14} aria-hidden="true">
              <rect x="2" y="2" width="5" height="5" rx="1" fill="white" fillOpacity="0.9" />
              <rect x="9" y="2" width="5" height="5" rx="1" fill="white" fillOpacity="0.6" />
              <rect x="2" y="9" width="5" height="5" rx="1" fill="white" fillOpacity="0.6" />
              <rect x="9" y="9" width="5" height="5" rx="1" fill="white" fillOpacity="0.9" />
            </svg>
          </div>
          <span style={{
            fontSize:      18,
            fontWeight:    600,
            color:         'var(--color-ink)',
            letterSpacing: '-0.3px',
          }}>AssetFlow</span>

          {/* Mobile close */}
          <button
            className="btn-icon-row"
            style={{ marginLeft: 'auto' }}
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Navigation sections ─────────────────────────────────────────── */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 8px' }}>
          {NAV_SECTIONS.map(section => (
            <div key={section.label}>
              <div className="sidebar-section-label">{section.label}</div>
              {section.items.map(({ label, path, icon: Icon }) => (
                <NavLink
                  key={path}
                  to={path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `nav-item ${isActive ? 'active' : ''}`
                  }
                  style={{ marginBottom: 2 }}
                >
                  <Icon size={16} style={{ flexShrink: 0 }} />
                  <span className="type-nav-link">{label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* ── User area at bottom ─────────────────────────────────────────── */}
        <div style={{
          padding:      '12px 12px',
          borderTop:    '1px solid #23252a',
          flexShrink:   0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Avatar */}
            <div style={{
              display:         'flex',
              alignItems:      'center',
              justifyContent:  'center',
              width:           32,
              height:          32,
              borderRadius:    '9999px',
              backgroundColor: 'var(--color-badge-brand-bg)',
              color:           'var(--color-primary-hover)',
              fontSize:        13,
              fontWeight:      600,
              flexShrink:      0,
            }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize:    13,
                fontWeight:  500,
                color:       'var(--color-ink)',
                margin:      0,
                overflow:    'hidden',
                textOverflow:'ellipsis',
                whiteSpace:  'nowrap',
              }}>
                {currentUser?.name ?? 'User'}
              </p>
              <span className={`badge ${roleBadge}`} style={{ marginTop: 2, display: 'inline-block' }}>
                {roleLabel}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main content column ───────────────────────────────────────────── */}
      <div style={{
        flex:           1,
        display:        'flex',
        flexDirection:  'column',
        minWidth:       0,
        marginLeft:     240,    /* sidebar width */
      }}
        className="af-content"
      >
        {/* ── Top Nav ───────────────────────────────────────────────────── */}
        <header className="top-nav" style={{ justifyContent: 'space-between' }}>
          {/* Left: hamburger (mobile) + breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              className="btn-icon-row"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
              style={{ display: 'none' }}   /* hidden on desktop via CSS */
              id="af-hamburger"
            >
              <Menu size={18} />
            </button>

            {/* Breadcrumb */}
            <span style={{
              fontSize:    13,
              fontWeight:  400,
              color:       'var(--color-ink-tertiary)',  /* ink-tertiary */
              letterSpacing: 0,
            }}>
              {breadcrumb}
            </span>
          </div>

          {/* Right: global search trigger + notifications + avatar dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Search trigger */}
            <button
              className="btn-icon-row"
              aria-label="Search (Ctrl+K)"
              style={{ width: 36 }}
            >
              <Search size={16} />
            </button>

            {/* Notifications */}
            <button className="btn-icon-row" aria-label="Notifications">
              <Bell size={16} />
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Profile dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                id="af-profile-trigger"
                onClick={() => setProfileOpen(!profileOpen)}
                style={{
                  display:         'flex',
                  alignItems:      'center',
                  gap:             6,
                  padding:         '5px 8px',
                  borderRadius:    8,
                  background:      'transparent',
                  border:          '1px solid transparent',
                  cursor:          'pointer',
                  transition:      `background-color var(--duration-fast) var(--ease-standard)`,
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-surface-1)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div style={{
                  width:           28,
                  height:          28,
                  borderRadius:    '9999px',
                  backgroundColor: 'var(--color-badge-brand-bg)',
                  color:           'var(--color-primary-hover)',
                  fontSize:        12,
                  fontWeight:      600,
                  display:         'flex',
                  alignItems:      'center',
                  justifyContent:  'center',
                  flexShrink:      0,
                }}>
                  {initials}
                </div>
                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-ink-muted)' }}>
                  {currentUser?.name ?? 'User'}
                </span>
                <ChevronDown size={14} color='var(--color-ink-subtle)' />
              </button>

              {profileOpen && (
                <>
                  <div
                    style={{ position: 'fixed', inset: 0, zIndex: 10 }}
                    onClick={() => setProfileOpen(false)}
                  />
                  <div style={{
                    position:        'absolute',
                    top:             'calc(100% + 6px)',
                    right:           0,
                    width:           200,
                    backgroundColor: 'var(--color-surface-3)',    /* surface-3 */
                    border:          '1px solid #34343a',
                    borderRadius:    10,
                    boxShadow:       '0 16px 48px rgba(0,0,0,0.44)',
                    zIndex:          20,
                    overflow:        'hidden',
                  }}>
                    <div style={{ padding: '12px 14px', borderBottom: '1px solid #23252a' }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: 'var(--color-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {currentUser?.email ?? ''}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--color-ink-subtle)' }}>{roleLabel}</p>
                    </div>
                    <button
                      id="af-signout"
                      onClick={handleLogout}
                      style={{
                        display:         'flex',
                        alignItems:      'center',
                        gap:             8,
                        width:           '100%',
                        padding:         '10px 14px',
                        fontSize:        14,
                        fontWeight:      500,
                        color:           'var(--color-semantic-error)',   /* semantic-error */
                        background:      'transparent',
                        border:          'none',
                        cursor:          'pointer',
                        transition:      `background-color var(--duration-fast) var(--ease-standard)`,
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(248,81,73,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <LogOut size={14} />
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* ── Page content ─────────────────────────────────────────────────── */}
        <main style={{
          flex:       1,
          overflowY:  'auto',
          padding:    '24px 32px',
        }}>
          <Outlet />
        </main>
      </div>

      {/* ── Responsive overrides (inline style fallback for desktop/mobile) ─ */}
      <style>{`
        /* Desktop: sidebar always visible */
        @media (min-width: 1025px) {
          .af-sidebar { transform: none !important; }
          #af-hamburger { display: none !important; }
        }
        /* Tablet: sidebar hidden by default (hamburger shows it) */
        @media (max-width: 1024px) {
          .af-sidebar {
            transform: translateX(-100%);
            transition: transform var(--duration-base) var(--ease-standard);
            left: 0;
          }
          .af-sidebar--open { transform: translateX(0) !important; }
          #af-hamburger { display: flex !important; }
          .af-content { margin-left: 0 !important; }
        }
        /* Mobile: same as tablet */
        @media (max-width: 640px) {
          .af-content > main { padding: 16px !important; }
        }
      `}</style>
    </div>
  );
}
