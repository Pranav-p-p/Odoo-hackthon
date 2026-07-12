/**
 * dashboard.controller.js
 * Receives requests, validates them, calls the service, returns responses.
 * No business logic here.
 *
 * Prisma client is injected via req.prisma (expected to be attached by app.js
 * middleware — coordinate with Member 1).
 *
 * Standard response envelope per API_CONTRACT.md:
 *   Success: { success: true, data: { ... }, message?: "..." }
 *   Error:   { success: false, error: { code, message, details } }
 */

const { fetchKpi, fetchRecentActivity } = require('./dashboard.service');

/**
 * GET /api/v1/dashboard/kpi
 * Returns all 7 KPI counts for the dashboard cards.
 */
const getKpi = async (req, res) => {
  try {
    const kpi = await fetchKpi(req.prisma);

    return res.status(200).json({
      success: true,
      data: kpi,
    });
  } catch (error) {
    console.error('[Dashboard] getKpi error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'DASHBOARD_KPI_ERROR',
        message: 'Failed to fetch dashboard KPIs.',
        details: {},
      },
    });
  }
};

/**
 * GET /api/v1/dashboard/recent-activity
 * Returns the latest 10 activity log entries.
 */
const getRecentActivity = async (req, res) => {
  try {
    const logs = await fetchRecentActivity(req.prisma);

    return res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (error) {
    console.error('[Dashboard] getRecentActivity error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'DASHBOARD_ACTIVITY_ERROR',
        message: 'Failed to fetch recent activity.',
        details: {},
      },
    });
  }
};

module.exports = {
  getKpi,
  getRecentActivity,
};
