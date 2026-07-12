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
 * @param {import('@prisma/client').PrismaClient} prisma
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
const fetchKpi = async (prisma) => {
  const kpi = await getKpiCounts(prisma);
  return kpi;
};

/**
 * Returns the 10 most recent activity log entries.
 *
 * @param {import('@prisma/client').PrismaClient} prisma
 * @returns {Promise<Array>}
 */
const fetchRecentActivity = async (prisma) => {
  const logs = await getRecentActivityLogs(prisma);
  return logs;
};

module.exports = {
  fetchKpi,
  fetchRecentActivity,
};
