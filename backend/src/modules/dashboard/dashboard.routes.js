/**
 * dashboard.routes.js
 * Mounts dashboard endpoints under /api/v1/dashboard (prefix set in app.js).
 *
 * Auth middleware:
 *   TODO: Import and apply authMiddleware once Member 1 merges auth branch.
 *   Replace the TODO line below with:
 *     const authMiddleware = require('../../middleware/auth.middleware');
 *   and add authMiddleware to each route: router.get('/kpi', authMiddleware, getKpi)
 */

const { Router } = require('express');
const { getKpi, getRecentActivity } = require('./dashboard.controller');

const router = Router();

// TODO: const authMiddleware = require('../../middleware/auth.middleware');

/**
 * GET /api/v1/dashboard/kpi
 * Returns 7 KPI counts for the dashboard header cards.
 * Requires: authenticated user (any role).
 */
router.get('/kpi', /* authMiddleware, */ getKpi);

/**
 * GET /api/v1/dashboard/recent-activity
 * Returns the latest 10 activity log entries.
 * Requires: authenticated user (any role).
 */
router.get('/recent-activity', /* authMiddleware, */ getRecentActivity);

module.exports = router;
