/**
 * notification.repository.js
 * Raw Prisma queries only — no business logic.
 * All functions receive prisma as a parameter (injected from service layer).
 *
 * Notification schema fields:
 *   id, userId, title, message, type, category, isRead, createdAt
 */

/**
 * Fetches a paginated list of notifications for a user.
 * Optionally filters by category and/or isRead status.
 *
 * @param {import('@prisma/client').PrismaClient} prisma
 * @param {string} userId
 * @param {{ category?: string, isRead?: boolean, page: number, limit: number }} filters
 * @returns {Promise<{ notifications: Array, total: number }>}
 */
const findNotifications = async (prisma, userId, { category, isRead, page, limit }) => {
  const where = { userId };

  // Apply category filter — skip if 'ALL' or not provided
  if (category && category !== 'ALL') {
    where.category = category;
  }

  // Apply isRead filter — only when explicitly provided (true or false)
  if (typeof isRead === 'boolean') {
    where.isRead = isRead;
  }

  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where }),
  ]);

  return { notifications, total };
};

/**
 * Returns the count of unread notifications for a user.
 *
 * @param {import('@prisma/client').PrismaClient} prisma
 * @param {string} userId
 * @returns {Promise<number>}
 */
const getUnreadCount = async (prisma, userId) => {
  return prisma.notification.count({
    where: { userId, isRead: false },
  });
};

/**
 * Marks a single notification as read.
 * Scoped to the userId to prevent users from marking others' notifications.
 *
 * @param {import('@prisma/client').PrismaClient} prisma
 * @param {string} notificationId
 * @param {string} userId
 * @returns {Promise<Object|null>} Updated notification, or null if not found/unauthorized
 */
const markOneRead = async (prisma, notificationId, userId) => {
  // Verify ownership before updating
  const existing = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
  });

  if (!existing) return null;

  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
};

/**
 * Marks all notifications as read for a given user.
 *
 * @param {import('@prisma/client').PrismaClient} prisma
 * @param {string} userId
 * @returns {Promise<{ count: number }>}
 */
const markAllRead = async (prisma, userId) => {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
};

module.exports = {
  findNotifications,
  getUnreadCount,
  markOneRead,
  markAllRead,
};
