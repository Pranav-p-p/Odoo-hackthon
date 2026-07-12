/**
 * activityLog.service.js
 * Business logic layer for Activity Logs.
 * Parses page/limit and coordinates repository calls.
 */

const { findLogs } = require('./activityLog.repository');

/**
 * Lists activity logs with pagination and filters.
 *
 * @param {Object} query - req.query
 * @returns {Promise<{ logs: Array, total: number, page: number, limit: number }>}
 */
const fetchLogs = async (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));

  const { entityType, entityId, userId } = query;

  const { logs, total } = await findLogs({
    entityType,
    entityId,
    userId,
    page,
    limit,
  });

  return { logs, total, page, limit };
};

module.exports = {
  fetchLogs,
};
