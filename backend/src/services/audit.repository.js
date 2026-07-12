/**
 * audit.repository.js
 * Raw Prisma queries only — no business logic.
 * Uses the shared Prisma singleton from config/prisma.js.
 */

const prisma = require('../config/prisma');

/**
 * Fetches all audit cycles matching the given filters.
 *
 * @param {Object} filters
 * @param {string} [filters.status]
 * @param {string} [filters.departmentId]
 * @returns {Promise<Array>}
 */
const findAudits = async ({ status, departmentId }) => {
  const where = {};
  if (status) {
    where.status = status;
  }
  if (departmentId) {
    where.departmentId = departmentId;
  }

  return prisma.auditCycle.findMany({
    where,
    include: {
      auditor: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Creates a new audit cycle record.
 *
 * @param {Object} data
 * @returns {Promise<Object>}
 */
const createAuditCycle = async (data) => {
  return prisma.auditCycle.create({
    data: {
      name: data.name,
      departmentId: data.departmentId || null,
      locationScope: data.locationScope || null,
      auditorId: data.auditorId,
      status: 'OPEN',
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    },
  });
};

/**
 * Finds all assets matching the given scope.
 *
 * @param {string} [departmentId]
 * @param {string} [locationScope]
 * @returns {Promise<Array>}
 */
const findAssetsForScope = async (departmentId, locationScope) => {
  const where = {};
  if (departmentId) {
    where.departmentId = departmentId;
  }
  if (locationScope) {
    where.location = {
      equals: locationScope,
      mode: 'insensitive',
    };
  }

  return prisma.asset.findMany({
    where,
    select: {
      id: true,
      status: true,
      location: true,
    },
  });
};

/**
 * Bulk creates audit items for a cycle.
 *
 * @param {Array<Object>} items
 * @returns {Promise<Object>}
 */
const createAuditItems = async (items) => {
  return prisma.auditItem.createMany({
    data: items,
  });
};

/**
 * Fetches full details of a specific audit cycle, including its items and related assets.
 *
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
const findAuditById = async (id) => {
  return prisma.auditCycle.findUnique({
    where: { id },
    include: {
      auditor: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: {
        include: {
          asset: {
            select: {
              id: true,
              assetTag: true,
              name: true,
              status: true,
              location: true,
              condition: true,
            },
          },
        },
      },
    },
  });
};

/**
 * Checks if a specific audit item exists in the scope of a specific audit cycle.
 *
 * @param {string} auditCycleId
 * @param {string} itemId
 * @returns {Promise<Object|null>}
 */
const findAuditItem = async (auditCycleId, itemId) => {
  return prisma.auditItem.findFirst({
    where: {
      id: itemId,
      auditCycleId,
    },
  });
};

/**
 * Updates status and notes of a specific audit item.
 *
 * @param {string} itemId
 * @param {Object} updateData
 * @returns {Promise<Object>}
 */
const updateAuditItem = async (itemId, { actualStatus, notes }) => {
  return prisma.auditItem.update({
    where: { id: itemId },
    data: {
      actualStatus,
      notes: notes || null,
    },
    include: {
      asset: {
        select: {
          id: true,
          assetTag: true,
          name: true,
        },
      },
    },
  });
};

/**
 * Fetches only the audit items flagged as missing or damaged in an audit cycle.
 *
 * @param {string} auditCycleId
 * @returns {Promise<Array>}
 */
const findDiscrepancies = async (auditCycleId) => {
  return prisma.auditItem.findMany({
    where: {
      auditCycleId,
      actualStatus: {
        in: ['MISSING', 'DAMAGED'],
      },
    },
    include: {
      asset: {
        select: {
          id: true,
          assetTag: true,
          name: true,
          status: true,
          location: true,
          condition: true,
        },
      },
    },
  });
};

/**
 * Closes an audit cycle and updates the closed date.
 *
 * @param {string} auditCycleId
 * @returns {Promise<Object>}
 */
const closeAuditCycle = async (auditCycleId) => {
  return prisma.auditCycle.update({
    where: { id: auditCycleId },
    data: {
      status: 'CLOSED',
      closedAt: new Date(),
    },
  });
};

/**
 * Updates statuses of multiple assets to LOST (or any other status).
 *
 * @param {Array<string>} assetIds
 * @param {string} status
 * @returns {Promise<Object>}
 */
const updateAssetsStatus = async (assetIds, status) => {
  return prisma.asset.updateMany({
    where: {
      id: { in: assetIds },
    },
    data: { status },
  });
};

module.exports = {
  findAudits,
  createAuditCycle,
  findAssetsForScope,
  createAuditItems,
  findAuditById,
  findAuditItem,
  updateAuditItem,
  findDiscrepancies,
  closeAuditCycle,
  updateAssetsStatus,
};
