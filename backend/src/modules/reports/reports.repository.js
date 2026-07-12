/**
 * reports.repository.js
 * Raw database queries for report generation.
 * Uses the shared Prisma singleton from config/prisma.js.
 */

const prisma = require('../../config/prisma');

/**
 * Fetches department allocation details.
 *
 * @returns {Promise<Array>}
 */
const getDepartmentAllocations = async () => {
  return prisma.department.findMany({
    where: { status: 'ACTIVE' },
    select: {
      id: true,
      name: true,
      _count: {
        select: { assets: true },
      },
    },
  });
};

/**
 * Fetches asset count metrics for department utilization.
 *
 * @param {string} [departmentId]
 * @returns {Promise<Array>}
 */
const getDepartmentAssetCounts = async (departmentId) => {
  const where = {};
  if (departmentId) {
    where.id = departmentId;
  } else {
    where.status = 'ACTIVE';
  }

  return prisma.department.findMany({
    where,
    select: {
      id: true,
      name: true,
      assets: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  });
};

/**
 * Fetches maintenance request counts for assets.
 *
 * @param {string} [categoryId]
 * @returns {Promise<Array>}
 */
const getMaintenanceCounts = async (categoryId) => {
  const where = {};
  if (categoryId) {
    where.categoryId = categoryId;
  }

  return prisma.asset.findMany({
    where,
    select: {
      id: true,
      assetTag: true,
      name: true,
      category: {
        select: {
          name: true,
        },
      },
      _count: {
        select: { maintenanceReqs: true },
      },
    },
    orderBy: {
      maintenanceReqs: {
        _count: 'desc',
      },
    },
  });
};

/**
 * Fetches assets that are AVAILABLE and older than 30 days.
 * Includes latest allocation to calculate inactivity period.
 *
 * @param {Date} cutoffDate
 * @returns {Promise<Array>}
 */
const getIdleAssets = async (cutoffDate) => {
  return prisma.asset.findMany({
    where: {
      status: 'AVAILABLE',
      createdAt: {
        lt: cutoffDate,
      },
    },
    select: {
      id: true,
      assetTag: true,
      name: true,
      location: true,
      condition: true,
      createdAt: true,
      allocations: {
        orderBy: {
          allocatedAt: 'desc',
        },
        take: 1,
        select: {
          returnedAt: true,
        },
      },
    },
  });
};

/**
 * Fetches usage metrics (allocation + booking counts) for all assets.
 *
 * @returns {Promise<Array>}
 */
const getUsageMetrics = async () => {
  return prisma.asset.findMany({
    select: {
      id: true,
      assetTag: true,
      name: true,
      location: true,
      _count: {
        select: {
          allocations: true,
          bookings: true,
        },
      },
    },
  });
};

/**
 * Fetches assets with poor or fair condition that are not retired/disposed.
 *
 * @returns {Promise<Array>}
 */
const getAssetsDueForMaintenance = async () => {
  return prisma.asset.findMany({
    where: {
      condition: {
        in: ['Poor', 'Fair'],
      },
      status: {
        in: ['AVAILABLE', 'ALLOCATED'],
      },
    },
    select: {
      id: true,
      assetTag: true,
      name: true,
      condition: true,
      location: true,
      status: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });
};

/**
 * Fetches booking records for the heatmap calculation.
 *
 * @param {string} [assetId]
 * @returns {Promise<Array>}
 */
const getBookingsForHeatmap = async (assetId) => {
  const where = {
    status: {
      not: 'CANCELLED',
    },
  };
  if (assetId) {
    where.assetId = assetId;
  }

  return prisma.booking.findMany({
    where,
    select: {
      startTime: true,
    },
  });
};

/**
 * Fetches raw records for report export.
 *
 * @param {string} type - utilization | maintenance | allocation | booking
 * @returns {Promise<Array>}
 */
const getExportData = async (type) => {
  if (type === 'utilization') {
    return prisma.department.findMany({
      where: { status: 'ACTIVE' },
      select: {
        name: true,
        assets: {
          select: {
            status: true,
          },
        },
      },
    });
  }

  if (type === 'maintenance') {
    return prisma.maintenanceRequest.findMany({
      select: {
        asset: {
          select: {
            assetTag: true,
            name: true,
          },
        },
        priority: true,
        status: true,
        issueDescription: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  if (type === 'allocation') {
    return prisma.allocation.findMany({
      select: {
        asset: {
          select: {
            assetTag: true,
            name: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
        status: true,
        allocatedAt: true,
        expectedReturn: true,
        returnedAt: true,
      },
      orderBy: { allocatedAt: 'desc' },
    });
  }

  if (type === 'booking') {
    return prisma.booking.findMany({
      select: {
        asset: {
          select: {
            assetTag: true,
            name: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
        startTime: true,
        endTime: true,
        status: true,
      },
      orderBy: { startTime: 'desc' },
    });
  }

  return [];
};

module.exports = {
  getDepartmentAllocations,
  getDepartmentAssetCounts,
  getMaintenanceCounts,
  getIdleAssets,
  getUsageMetrics,
  getAssetsDueForMaintenance,
  getBookingsForHeatmap,
  getExportData,
};
