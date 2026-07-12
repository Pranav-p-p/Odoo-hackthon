/**
 * dashboard.repository.js
 * Raw Prisma queries only — no business logic.
 * Uses the shared Prisma singleton from config/prisma.js.
 */

const prisma = require('../config/prisma');

/**
 * Fetches all raw counts needed to build the KPI payload.
 * All 7 queries run in parallel via Promise.all for performance.
 * @returns {Promise<Object>}
 */
const getKpiCounts = async () => {
  const now = new Date();

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  const sevenDaysFromNow = new Date(now);
  sevenDaysFromNow.setDate(now.getDate() + 7);

  const [
    assetsAvailable,
    assetsAllocated,
    maintenanceToday,
    upcomingReturns,
    pendingTransfers,
    activeBookings,
    overdueReturns,
  ] = await Promise.all([
    // Assets with status AVAILABLE
    prisma.asset.count({
      where: { status: 'AVAILABLE' },
    }),

    // Assets with status ALLOCATED
    prisma.asset.count({
      where: { status: 'ALLOCATED' },
    }),

    // Maintenance requests raised today (regardless of status)
    prisma.maintenanceRequest.count({
      where: {
        createdAt: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
    }),

    // Active allocations with expectedReturn within the next 7 days
    prisma.allocation.count({
      where: {
        status: 'ACTIVE',
        expectedReturn: {
          gte: now,
          lte: sevenDaysFromNow,
        },
      },
    }),

    // Transfers waiting for approval
    prisma.transfer.count({
      where: { status: 'REQUESTED' },
    }),

    // Bookings currently ONGOING
    prisma.booking.count({
      where: { status: 'ONGOING' },
    }),

    // Active allocations whose expectedReturn has already passed (overdue)
    prisma.allocation.count({
      where: {
        status: 'ACTIVE',
        expectedReturn: {
          lt: now,
        },
      },
    }),
  ]);

  return {
    assetsAvailable,
    assetsAllocated,
    maintenanceToday,
    upcomingReturns,
    pendingTransfers,
    activeBookings,
    overdueReturns,
  };
};

/**
 * Fetches the 10 most recent activity log entries.
 * @returns {Promise<Array>}
 */
const getRecentActivityLogs = async () => {
  return prisma.activityLog.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
  });
};

module.exports = {
  getKpiCounts,
  getRecentActivityLogs,
};
