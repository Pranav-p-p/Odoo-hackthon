/**
 * notification.controller.js
 * Receives requests, calls service, returns responses.
 * No business logic here.
 *
 * Assumes req.prisma is attached by app.js middleware (coordinate with Member 1).
 * Assumes req.user is attached by auth.middleware.js (coordinate with Member 1).
 *
 * Standard response envelope per API_CONTRACT.md:
 *   Success:   { success: true, data: {...}, message?: "..." }
 *   Paginated: { success: true, data: [...], pagination: { page, limit, total } }
 *   Error:     { success: false, error: { code, message, details } }
 */

const {
  listNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} = require('./notification.service');

/**
 * GET /api/v1/notifications
 * Query params: category (ALL|ALERTS|APPROVALS|BOOKINGS), isRead (true|false), page, limit
 * Returns a paginated list of the current user's notifications, newest first.
 */
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notifications, total, page, limit } = await listNotifications(
      req.prisma,
      userId,
      req.query
    );

    return res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        page,
        limit,
        total,
      },
    });
  } catch (error) {
    console.error('[Notification] getNotifications error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'NOTIFICATION_LIST_ERROR',
        message: 'Failed to fetch notifications.',
        details: {},
      },
    });
  }
};

/**
 * GET /api/v1/notifications/unread-count
 * Returns the count of unread notifications for the current user.
 * Response: { count: N }
 */
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await fetchUnreadCount(req.prisma, userId);

    return res.status(200).json({
      success: true,
      data: { count },
    });
  } catch (error) {
    console.error('[Notification] getUnreadCount error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'NOTIFICATION_COUNT_ERROR',
        message: 'Failed to fetch unread count.',
        details: {},
      },
    });
  }
};

/**
 * PATCH /api/v1/notifications/:id/read
 * Marks a specific notification as read.
 * Scoped to the current user — cannot mark another user's notification.
 */
const markRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const updated = await markNotificationRead(req.prisma, id, userId);

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOTIFICATION_NOT_FOUND',
          message: 'Notification not found or does not belong to you.',
          details: {},
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: updated,
      message: 'Notification marked as read.',
    });
  } catch (error) {
    console.error('[Notification] markRead error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'NOTIFICATION_MARK_READ_ERROR',
        message: 'Failed to mark notification as read.',
        details: {},
      },
    });
  }
};

/**
 * PATCH /api/v1/notifications/read-all
 * Marks all notifications as read for the current user.
 */
const markAllRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await markAllNotificationsRead(req.prisma, userId);

    return res.status(200).json({
      success: true,
      data: { updatedCount: result.count },
      message: 'All notifications marked as read.',
    });
  } catch (error) {
    console.error('[Notification] markAllRead error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'NOTIFICATION_MARK_ALL_READ_ERROR',
        message: 'Failed to mark all notifications as read.',
        details: {},
      },
    });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
};
