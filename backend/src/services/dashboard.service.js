/**
 * dashboard.service.js
 * Business logic layer — orchestrates repository calls.
 * Controllers call this; this calls the repository.
 */

const { getKpiCounts, getRecentActivityLogs } = require('./dashboard.repository');

/**
 * Returns the KPI payload for the dashboard.
 * All seven fields are guaranteed to be present in the response.
 *
 * @returns {Promise<{
 *   assetsAvailable: number,
 *   assetsAllocated: number,
 *   maintenanceToday: number,
 *   upcomingReturns: number,
 *   pendingTransfers: number,
 *   activeBookings: number,
 *   overdueReturns: number
 * }>}
 */
const fetchKpi = async () => {
  const kpi = await getKpiCounts();
  return kpi;
};

/**
 * Returns the 10 most recent activity log entries.
 *
 * @returns {Promise<Array>}
 */
const fetchRecentActivity = async () => {
  const logs = await getRecentActivityLogs();
  return logs;
};

module.exports = {
  fetchKpi,
  fetchRecentActivity,
};
