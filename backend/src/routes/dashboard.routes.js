/**
 * dashboard.routes.js
 * Mounts dashboard endpoints under /api/v1/dashboard (prefix set in server.js).
 */

const { Router } = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const { getKpi, getRecentActivity } = require('../controllers/dashboard.controller');

const router = Router();

/**
 * GET /api/v1/dashboard/kpi
 * Returns 7 KPI counts for the dashboard header cards.
 * Requires: authenticated user (any role).
 */
router.get('/kpi', authenticate, getKpi);

/**
 * GET /api/v1/dashboard/recent-activity
 * Returns the latest 10 activity log entries.
 * Requires: authenticated user (any role).
 */
router.get('/recent-activity', authenticate, getRecentActivity);

module.exports = router;
