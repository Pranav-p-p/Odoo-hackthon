/**
 * notification.routes.js
 * Mounts notification endpoints under /api/v1/notifications (prefix set in server.js).
 *
 * IMPORTANT — route order matters here:
 *   PATCH /notifications/read-all  must be declared BEFORE
 *   PATCH /notifications/:id/read  to prevent Express matching "read-all" as an :id param.
 */

const { Router } = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const {
  getNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
} = require('../controllers/notification.controller');

const router = Router();

/**
 * GET /api/v1/notifications
 * Query: ?category=ALL|ALERTS|APPROVALS|BOOKINGS &isRead=true|false &page=1 &limit=20
 * Returns paginated notifications for the authenticated user, newest first.
 */
router.get('/', authenticate, getNotifications);

/**
 * GET /api/v1/notifications/unread-count
 * Returns { count: N } — the number of unread notifications for the current user.
 * Declared BEFORE /:id routes to avoid route conflict.
 */
router.get('/unread-count', authenticate, getUnreadCount);

/**
 * PATCH /api/v1/notifications/read-all
 * Marks ALL notifications as read for the current user.
 * Declared BEFORE /:id/read to prevent 'read-all' being captured as :id.
 */
router.patch('/read-all', authenticate, markAllRead);

/**
 * PATCH /api/v1/notifications/:id/read
 * Marks a specific notification as read.
 * Only succeeds if the notification belongs to the current user.
 */
router.patch('/:id/read', authenticate, markRead);

module.exports = router;
