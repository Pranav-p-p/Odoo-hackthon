import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
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
  ChevronDown,
} from 'lucide-react';

/**
 * Sidebar navigation items.
 * Each item maps to an icon and a route.
 */
const NAV_ITEMS = [
  { label: 'Dashboard',         path: '/dashboard',         icon: LayoutDashboard },
  { label: 'Organization',      path: '/organization',      icon: Building2 },
  { label: 'Assets',            path: '/assets',            icon: Package },
  { label: 'Allocations',       path: '/allocations',       icon: ArrowLeftRight },
  { label: 'Bookings',          path: '/bookings',          icon: CalendarClock },
  { label: 'Maintenance',       path: '/maintenance',       icon: Wrench },
  { label: 'Audits',            path: '/audits',            icon: ClipboardCheck },
  { label: 'Reports',           path: '/reports',           icon: BarChart3 },
  { label: 'Notifications',     path: '/notifications',     icon: Bell },
];

/**
 * Role badge color map
 */
const ROLE_COLORS = {
  ADMIN: 'bg-red-100 text-red-700',
  ASSET_MANAGER: 'bg-blue-100 text-blue-700',
  DEPARTMENT_HEAD: 'bg-amber-100 text-amber-700',
  EMPLOYEE: 'bg-green-100 text-green-700',
};

/**
 * DashboardLayout
 * Sidebar navigation + top header + scrollable content area.
 * Uses <Outlet /> to render the matched child route.
 */
export default function DashboardLayout() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  // Formatted role label
  const roleLabel = currentUser?.role?.replace('_', ' ') || 'User';

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">

      {/* ── Mobile overlay ────────────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ───────────────────────────────────────────────────── */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200',
          'transform transition-transform duration-200 ease-in-out',
          'lg:relative lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 flex-shrink-0">
            <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" aria-hidden="true">
              <rect x="3" y="3" width="6" height="6" rx="1" fill="white" fillOpacity="0.9" />
              <rect x="11" y="3" width="6" height="6" rx="1" fill="white" fillOpacity="0.6" />
              <rect x="3" y="11" width="6" height="6" rx="1" fill="white" fillOpacity="0.6" />
              <rect x="11" y="11" width="6" height="6" rx="1" fill="white" fillOpacity="0.9" />
            </svg>
          </div>
          <span className="text-lg font-semibold text-slate-900 tracking-tight">AssetFlow</span>

          {/* Close button (mobile) */}
          <button
            className="ml-auto lg:hidden p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => [
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium',
                'transition-colors duration-150',
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              ].join(' ')}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User info at bottom of sidebar */}
        <div className="px-4 py-4 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold flex-shrink-0">
              {currentUser?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {currentUser?.name || 'User'}
              </p>
              <span className={`inline-block text-xs px-1.5 py-0.5 rounded font-medium ${ROLE_COLORS[currentUser?.role] || 'bg-slate-100 text-slate-600'}`}>
                {roleLabel}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Content Area ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top Header Bar */}
        <header className="flex items-center justify-between px-4 sm:px-6 py-3 bg-white border-b border-slate-200 flex-shrink-0">
          {/* Hamburger (mobile) */}
          <button
            className="p-2 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
                {currentUser?.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <span className="hidden sm:inline font-medium">{currentUser?.name || 'User'}</span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>

            {profileOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-sm font-medium text-slate-900 truncate">{currentUser?.email}</p>
                    <p className="text-xs text-slate-500">{roleLabel}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
