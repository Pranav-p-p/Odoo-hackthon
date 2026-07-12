/**
 * activityLog.routes.js
 * Mounts Activity Logs endpoints under /api/v1/activity-logs.
 */

const { Router } = require('express');
const { authenticate } = require('../../middleware/auth.middleware');
const { getActivityLogs } = require('./activityLog.controller');

const router = Router();

/**
 * GET /api/v1/activity-logs
 * Paginated list of system logs. Filter by user, entity type/id.
 */
router.get('/', authenticate, getActivityLogs);

module.exports = router;
