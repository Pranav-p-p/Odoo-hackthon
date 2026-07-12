import React, { useState, useEffect } from 'react';
import {
  Check,
  CheckCheck,
  BellOff,
  AlertTriangle,
  FileText,
  Calendar,
  RefreshCw,
  Inbox,
} from 'lucide-react';
import {
  getNotifications,
  markRead,
  markAllRead,
} from '../../api/notification.api';

const TABS = [
  { id: 'ALL', label: 'All Notifications' },
  { id: 'ALERTS', label: 'Alerts' },
  { id: 'APPROVALS', label: 'Approvals' },
  { id: 'BOOKINGS', label: 'Bookings' },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0 });

  const fetchList = async (page = 1, shouldAppend = false) => {
    try {
      setLoading(true);
      const res = await getNotifications({
        category: activeTab,
        page,
        limit: pagination.limit,
      });

      if (res.success) {
        setNotifications((prev) => (shouldAppend ? [...prev, ...res.data] : res.data));
        setPagination({
          page: res.pagination.page,
          limit: res.pagination.limit,
          total: res.pagination.total,
        });
      }
    } catch (err) {
      console.error('[NotificationsPage] Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList(1, false);
  }, [activeTab]);

  const handleMarkRead = async (id) => {
    try {
      const res = await markRead(id);
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
      }
    } catch (err) {
      console.error('[NotificationsPage] Error marking read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await markAllRead();
      if (res.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch (err) {
      console.error('[NotificationsPage] Error marking all read:', err);
    }
  };

  const handleLoadMore = () => {
    if (notifications.length < pagination.total) {
      fetchList(pagination.page + 1, true);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'ALERTS':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'APPROVALS':
        return <FileText className="h-4 w-4 text-amber-500" />;
      case 'BOOKINGS':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      default:
        return <Inbox className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Notifications</h1>
          <p className="mt-1 text-sm text-gray-500 font-medium">
            Inbox for approvals, booking flags, and system alerts.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => fetchList(1, false)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button
            onClick={handleMarkAllRead}
            disabled={notifications.every((n) => n.isRead)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCheck className="h-4 w-4" />
            Mark All Read
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`border-b-2 py-4 px-1 text-sm font-semibold whitespace-nowrap transition-colors focus:outline-none ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Notifications List */}
      <div className="mt-6 space-y-4">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-100 rounded-2xl shadow-sm text-center">
            <BellOff className="h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-bold text-gray-950">Your inbox is clear</h3>
            <p className="mt-1 text-sm text-gray-400">No notifications found in this tab.</p>
          </div>
        ) : (
          <div className="overflow-hidden bg-white border border-gray-100 rounded-2xl shadow-sm divide-y divide-gray-50">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`flex items-start justify-between p-5 transition-colors ${
                  notif.isRead ? 'bg-white' : 'bg-indigo-50/20'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-gray-50 p-2.5 mt-0.5 shadow-sm border border-gray-100">
                    {getCategoryIcon(notif.category)}
                  </div>
                  <div>
                    <h4 className={`text-sm ${notif.isRead ? 'font-medium text-gray-900' : 'font-bold text-gray-950'}`}>
                      {notif.title}
                    </h4>
                    <p className="mt-1 text-sm text-gray-600 font-medium">{notif.message}</p>
                    <span className="mt-2 block text-xs text-gray-400">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' + new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {!notif.isRead && (
                  <button
                    onClick={() => handleMarkRead(notif.id)}
                    className="rounded-xl border border-gray-200 bg-white p-2 text-gray-500 hover:bg-gray-50 hover:text-indigo-600 transition-colors shadow-sm"
                    title="Mark as read"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {notifications.length < pagination.total && (
          <div className="flex justify-center mt-6">
            <button
              onClick={handleLoadMore}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-gray-200 px-6 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
