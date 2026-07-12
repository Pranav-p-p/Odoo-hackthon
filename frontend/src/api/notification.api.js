import apiClient from './authApi';

/**
 * GET /notifications
 * Fetches user's paginated, filtered notifications list.
 *
 * @param {Object} params
 * @param {string} [params.category] - ALL, ALERTS, APPROVALS, BOOKINGS
 * @param {boolean|string} [params.isRead] - true, false
 * @param {number} [params.page]
 * @param {number} [params.limit]
 */
export async function getNotifications(params = {}) {
  const response = await apiClient.get('/notifications', { params });
  return response.data;
}

/**
 * GET /notifications/unread-count
 * Returns { count: N }
 */
export async function getUnreadCount() {
  const response = await apiClient.get('/notifications/unread-count');
  return response.data;
}

/**
 * PATCH /notifications/:id/read
 * Marks a specific notification as read.
 */
export async function markRead(id) {
  const response = await apiClient.patch(`/notifications/${id}/read`);
  return response.data;
}

/**
 * PATCH /notifications/read-all
 * Marks all notifications for this user as read.
 */
export async function markAllRead() {
  const response = await apiClient.patch('/notifications/read-all');
  return response.data;
}
