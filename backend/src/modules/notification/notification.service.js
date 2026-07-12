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
 * @param {import('@prisma/client').PrismaClient} prisma
 * @param {string} userId - from req.user.id
 * @param {Object} query - from req.query
 * @returns {Promise<{ notifications: Array, total: number, page: number, limit: number }>}
 */
const listNotifications = async (prisma, userId, query) => {
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

  const { notifications, total } = await findNotifications(prisma, userId, {
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
 * @param {import('@prisma/client').PrismaClient} prisma
 * @param {string} userId
 * @returns {Promise<number>}
 */
const fetchUnreadCount = async (prisma, userId) => {
  return getUnreadCount(prisma, userId);
};

/**
 * Marks a single notification as read.
 * Returns null if the notification does not exist or belongs to another user.
 *
 * @param {import('@prisma/client').PrismaClient} prisma
 * @param {string} notificationId
 * @param {string} userId
 * @returns {Promise<Object|null>}
 */
const markNotificationRead = async (prisma, notificationId, userId) => {
  return markOneRead(prisma, notificationId, userId);
};

/**
 * Marks all notifications as read for the current user.
 *
 * @param {import('@prisma/client').PrismaClient} prisma
 * @param {string} userId
 * @returns {Promise<{ count: number }>}
 */
const markAllNotificationsRead = async (prisma, userId) => {
  return markAllRead(prisma, userId);
};

module.exports = {
  listNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
};
