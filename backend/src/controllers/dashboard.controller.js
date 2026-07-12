/**
 * dashboard.controller.js
 * Receives requests, calls the service, returns responses.
 * No business logic here.
 *
 * Standard response envelope per API_CONTRACT.md:
 *   Success: { success: true, data: { ... }, message?: "..." }
 *   Error:   { success: false, error: { code, message, details } }
 */

const { fetchKpi, fetchRecentActivity } = require('../services/dashboard.service');

/**
 * GET /api/v1/dashboard/kpi
 * Returns all 7 KPI counts for the dashboard cards.
 */
const getKpi = async (req, res, next) => {
  try {
    const kpi = await fetchKpi();

    return res.status(200).json({
      success: true,
      data: kpi,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/dashboard/recent-activity
 * Returns the latest 10 activity log entries.
 */
const getRecentActivity = async (req, res, next) => {
  try {
    const logs = await fetchRecentActivity();

    return res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getKpi,
  getRecentActivity,
};
