/**
 * activityLog.controller.js
 * Receives requests, calls service, returns responses.
 * Delegates errors to global error handler via next(err).
 *
 * Standard response envelope per API_CONTRACT.md:
 *   Paginated: { success: true, data: [...], pagination: { page, limit, total } }
 *   Error:     { success: false, error: { code, message, details } }
 */

const { fetchLogs } = require('./activityLog.service');

/**
 * GET /api/v1/activity-logs
 * Query: entityType, entityId, userId, page, limit
 */
const getActivityLogs = async (req, res, next) => {
  try {
    const { logs, total, page, limit } = await fetchLogs(req.query);

    return res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        page,
        limit,
        total,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getActivityLogs,
};
