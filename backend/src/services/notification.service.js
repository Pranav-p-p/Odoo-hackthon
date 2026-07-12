/**
 * notification.service.js
 * Business logic layer — parses and validates inputs, orchestrates repository calls.
 * Controllers call this; this calls the repository.
 */

const {
  findNotifications,
  getUnreadCount,
  markOneRead,
  markAllRead,
} = require('./notification.repository');

// Valid category values per SHARED_ENUMS.md
const VALID_CATEGORIES = ['ALL', 'ALERTS', 'APPROVALS', 'BOOKINGS'];

/**
 * Returns a paginated list of notifications for the current user.
 *
 * @param {string} userId - from req.user.id
 * @param {Object} query - from req.query
 * @returns {Promise<{ notifications: Array, total: number, page: number, limit: number }>}
 */
const listNotifications = async (userId, query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));

  // Validate category — default to 'ALL' if invalid or missing
  const category =
    query.category && VALID_CATEGORIES.includes(query.category.toUpperCase())
      ? query.category.toUpperCase()
      : 'ALL';

  // Parse isRead: only filter when explicitly 'true' or 'false'
  let isRead;
  if (query.isRead === 'true') isRead = true;
  else if (query.isRead === 'false') isRead = false;

  const { notifications, total } = await findNotifications(userId, {
    category,
    isRead,
    page,
    limit,
  });

  return { notifications, total, page, limit };
};

/**
 * Returns the count of unread notifications for the current user.
 *
 * @param {string} userId
 * @returns {Promise<number>}
 */
const fetchUnreadCount = async (userId) => {
  return getUnreadCount(userId);
};

/**
 * Marks a single notification as read.
 * Returns null if the notification does not exist or belongs to another user.
 *
 * @param {string} notificationId
 * @param {string} userId
 * @returns {Promise<Object|null>}
 */
const markNotificationRead = async (notificationId, userId) => {
  return markOneRead(notificationId, userId);
};

/**
 * Marks all notifications as read for the current user.
 *
 * @param {string} userId
 * @returns {Promise<{ count: number }>}
 */
const markAllNotificationsRead = async (userId) => {
  return markAllRead(userId);
};

module.exports = {
  listNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
};
