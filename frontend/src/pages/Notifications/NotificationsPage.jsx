import React, { useState, useEffect } from 'react';
import {
  Check, CheckCheck, BellOff, AlertTriangle,
  FileText, Calendar, RefreshCw, Inbox, Bell,
} from 'lucide-react';
import { getNotifications, markRead, markAllRead } from '../../api/notification.api';

/* ─────────────────────────────────────────────────────────────────────────────
   NotificationsPage — DESIGN.md dark canvas
   Inbox for approvals, booking flags, and system alerts.
───────────────────────────────────────────────────────────────────────────── */

const TABS = [
  { id: 'ALL',       label: 'All' },
  { id: 'ALERTS',    label: 'Alerts' },
  { id: 'APPROVALS', label: 'Approvals' },
  { id: 'BOOKINGS',  label: 'Bookings' },
];

/* Category → icon + color */
const CATEGORY_CONFIG = {
  ALERTS:    { icon: AlertTriangle, color: '#f85149' },  /* semantic-error */
  APPROVALS: { icon: FileText,      color: '#d29922' },  /* semantic-warning */
  BOOKINGS:  { icon: Calendar,      color: '#58a6ff' },  /* semantic-info */
  default:   { icon: Inbox,         color: '#8a8f98' },  /* ink-subtle */
};

function getCategoryConfig(cat) {
  return CATEGORY_CONFIG[cat] ?? CATEGORY_CONFIG.default;
}

function formatTime(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      + ' · '
      + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch { return iso; }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab]         = useState('ALL');
  const [loading, setLoading]             = useState(true);
  const [pagination, setPagination]       = useState({ page: 1, limit: 15, total: 0 });

  const fetchList = async (page = 1, shouldAppend = false) => {
    try {
      setLoading(true);
      const res = await getNotifications({ category: activeTab, page, limit: pagination.limit });
      if (res.success) {
        setNotifications(prev => shouldAppend ? [...prev, ...res.data] : res.data);
        setPagination({ page: res.pagination.page, limit: res.pagination.limit, total: res.pagination.total });
      }
    } catch (err) {
      console.error('[NotificationsPage] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchList(1, false); }, [activeTab]);

  const handleMarkRead = async (id) => {
    try {
      const res = await markRead(id);
      if (res.success) setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) { console.error('[NotificationsPage] Mark read error:', err); }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await markAllRead();
      if (res.success) setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) { console.error('[NotificationsPage] Mark all error:', err); }
  };

  const allRead = notifications.every(n => n.isRead);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Bell size={18} color="#5e6ad2" />
            <h1 className="type-display-md" style={{ color: '#f7f8f8', margin: 0 }}>Notifications</h1>
            {unreadCount > 0 && (
              <span style={{
                display: 'inline-flex', alignItems: 'center',
                backgroundColor: 'rgba(94,106,210,0.16)', color: '#828fff',
                borderRadius: 9999, padding: '2px 8px', fontSize: 11, fontWeight: 600,
              }}>
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="type-body-sm" style={{ color: '#8a8f98', marginTop: 6 }}>
            Inbox for approvals, booking flags, and system alerts.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => fetchList(1, false)} className="btn-secondary">
            <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
          <button
            onClick={handleMarkAllRead}
            disabled={allRead}
            className="btn-primary"
            style={{ opacity: allRead ? 0.5 : 1, cursor: allRead ? 'not-allowed' : 'pointer' }}
          >
            <CheckCheck size={14} />
            Mark All Read
          </button>
        </div>
      </div>

      {/* ── Tab bar ───────────────────────────────────────────────────────── */}
      <div style={{ borderBottom: '1px solid #23252a', marginBottom: 24 }}>
        <nav style={{ display: 'flex', gap: 0 }} aria-label="Notification categories">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding:          '10px 16px',
                fontSize:         13,
                fontWeight:       activeTab === tab.id ? 600 : 400,
                color:            activeTab === tab.id ? '#f7f8f8' : '#8a8f98',
                borderBottom:     `2px solid ${activeTab === tab.id ? '#5e6ad2' : 'transparent'}`,
                background:       'transparent',
                border:           'none',
                borderBottomStyle:'solid',
                borderBottomWidth: 2,
                borderBottomColor: activeTab === tab.id ? '#5e6ad2' : 'transparent',
                cursor:           'pointer',
                transition:       'color var(--duration-fast) var(--ease-standard)',
                whiteSpace:       'nowrap',
              }}
              aria-selected={activeTab === tab.id}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ── Notification list ─────────────────────────────────────────────── */}
      {notifications.length === 0 && !loading ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '64px 16px', textAlign: 'center',
          backgroundColor: '#0f1011', border: '1px solid #23252a', borderRadius: 12,
        }}>
          <BellOff size={36} color="#3e3e44" style={{ marginBottom: 16 }} />
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#f7f8f8', margin: 0 }}>Your inbox is clear</h3>
          <p className="type-body-sm" style={{ color: '#8a8f98', marginTop: 6 }}>No notifications found in this tab.</p>
        </div>
      ) : (
        <div style={{ backgroundColor: '#0f1011', border: '1px solid #23252a', borderRadius: 12, overflow: 'hidden' }}>
          {notifications.map((notif, idx) => {
            const { icon: Icon, color } = getCategoryConfig(notif.category);
            const isLast = idx === notifications.length - 1;
            return (
              <div
                key={notif.id}
                style={{
                  display:         'flex',
                  alignItems:      'flex-start',
                  justifyContent:  'space-between',
                  gap:             16,
                  padding:         '16px 20px',
                  backgroundColor: notif.isRead ? 'transparent' : 'rgba(94,106,210,0.04)',
                  borderBottom:    isLast ? 'none' : '1px solid #23252a',
                  transition:      'background-color var(--duration-fast) var(--ease-standard)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  {/* Category icon dot */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                    backgroundColor: `${color}22`,
                    marginTop: 1,
                  }}>
                    <Icon size={14} color={color} />
                  </div>

                  <div>
                    <p style={{
                      fontSize: 13, fontWeight: notif.isRead ? 400 : 600,
                      color: notif.isRead ? '#d0d6e0' : '#f7f8f8', margin: 0,
                    }}>
                      {notif.title}
                    </p>
                    <p style={{ fontSize: 13, color: '#8a8f98', margin: '3px 0 0' }}>
                      {notif.message}
                    </p>
                    <span className="type-mono" style={{ color: '#62666d', display: 'block', marginTop: 4 }}>
                      {formatTime(notif.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Mark read */}
                {!notif.isRead && (
                  <button
                    onClick={() => handleMarkRead(notif.id)}
                    className="btn-icon-row"
                    title="Mark as read"
                    aria-label="Mark as read"
                    style={{ flexShrink: 0, marginTop: 2 }}
                  >
                    <Check size={13} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Load more ─────────────────────────────────────────────────────── */}
      {notifications.length < pagination.total && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
          <button
            onClick={() => fetchList(pagination.page + 1, true)}
            className="btn-secondary"
          >
            Load more
          </button>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
