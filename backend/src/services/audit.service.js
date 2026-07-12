/**
 * audit.service.js
 * Business logic layer for Audits.
 * Manages side effects like logging, admin notifications, and updating missing assets to LOST.
 */

const prisma = require('../config/prisma');
const { createLog } = require('../utils/createLog');
const { createNotification } = require('../utils/createNotification');
const { createError } = require('../middleware/error.middleware');
const {
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
} = require('./audit.repository');

/**
 * Lists audit cycles matching filters.
 *
 * @param {Object} query
 * @returns {Promise<Array>}
 */
const listAuditsService = async (query) => {
  const { status, departmentId } = query;
  return findAudits({ status, departmentId });
};

/**
 * Creates an audit cycle and populates items.
 *
 * @param {Object} data
 * @param {string} userId - auditor raising the request
 * @returns {Promise<Object>}
 */
const createAuditService = async (data) => {
  // Start transaction or sequence
  const cycle = await createAuditCycle(data);

  // Fetch all assets matching the departmentId and/or locationScope
  const assets = await findAssetsForScope(data.departmentId, data.locationScope);

  if (assets.length > 0) {
    const items = assets.map((asset) => ({
      auditCycleId: cycle.id,
      assetId: asset.id,
      expectedLocation: asset.location || null,
      expectedStatus: asset.status,
      actualStatus: 'PENDING',
    }));

    await createAuditItems(items);
  }

  // Create audit activity log
  await createLog({
    userId: data.auditorId,
    action: 'AUDIT_CYCLE_CREATED',
    entityType: 'AuditCycle',
    entityId: cycle.id,
    details: {
      name: cycle.name,
      itemsCount: assets.length,
    },
  });

  return findAuditById(cycle.id);
};

/**
 * Fetches an audit cycle by ID.
 *
 * @param {string} id
 * @returns {Promise<Object>}
 */
const fetchAuditByIdService = async (id) => {
  const audit = await findAuditById(id);
  if (!audit) {
    throw createError(404, 'AUDIT_NOT_FOUND', 'Audit cycle not found.');
  }
  return audit;
};

/**
 * Updates status of a specific audit item.
 *
 * @param {string} auditId
 * @param {string} itemId
 * @param {Object} updateData
 * @param {string} userId
 * @returns {Promise<Object>}
 */
const verifyItemService = async (auditId, itemId, { actualStatus, notes }, userId) => {
  const audit = await findAuditById(auditId);
  if (!audit) {
    throw createError(404, 'AUDIT_NOT_FOUND', 'Audit cycle not found.');
  }

  if (audit.status === 'CLOSED') {
    throw createError(400, 'AUDIT_CYCLE_CLOSED', 'Cannot update items in a closed audit cycle.');
  }

  const item = await findAuditItem(auditId, itemId);
  if (!item) {
    throw createError(404, 'AUDIT_ITEM_NOT_FOUND', 'Audit item not found in this cycle.');
  }

  // Update cycle status to IN_PROGRESS if it's currently OPEN
  if (audit.status === 'OPEN') {
    await prisma.auditCycle.update({
      where: { id: auditId },
      data: { status: 'IN_PROGRESS' },
    });
  }

  const updatedItem = await updateAuditItem(itemId, { actualStatus, notes });

  await createLog({
    userId,
    action: 'AUDIT_ITEM_VERIFIED',
    entityType: 'AuditItem',
    entityId: itemId,
    details: {
      auditCycleId: auditId,
      assetTag: updatedItem.asset.assetTag,
      actualStatus,
    },
  });

  return updatedItem;
};

/**
 * Fetches the discrepancy report for a specific cycle.
 *
 * @param {string} auditId
 * @returns {Promise<Array>}
 */
const fetchDiscrepancyReportService = async (auditId) => {
  const audit = await findAuditById(auditId);
  if (!audit) {
    throw createError(404, 'AUDIT_NOT_FOUND', 'Audit cycle not found.');
  }
  return findDiscrepancies(auditId);
};

/**
 * Closes an audit cycle, updates missing assets status to LOST,
 * and notifies all active Admin users of discrepancies.
 *
 * @param {string} auditId
 * @param {string} userId
 * @returns {Promise<Object>}
 */
const closeAuditCycleService = async (auditId, userId) => {
  const audit = await findAuditById(auditId);
  if (!audit) {
    throw createError(404, 'AUDIT_NOT_FOUND', 'Audit cycle not found.');
  }

  if (audit.status === 'CLOSED') {
    throw createError(400, 'AUDIT_ALREADY_CLOSED', 'Audit cycle is already closed.');
  }

  // Update cycle status to CLOSED
  const closedCycle = await closeAuditCycle(auditId);

  // Update missing assets status to LOST in the system
  const missingItems = audit.items.filter((item) => item.actualStatus === 'MISSING');
  if (missingItems.length > 0) {
    const missingAssetIds = missingItems.map((item) => item.assetId);
    await updateAssetsStatus(missingAssetIds, 'LOST');
  }

  // Activity Log
  await createLog({
    userId,
    action: 'AUDIT_CYCLE_CLOSED',
    entityType: 'AuditCycle',
    entityId: auditId,
    details: {
      name: audit.name,
      discrepancyCount: audit.items.filter(
        (i) => i.actualStatus === 'MISSING' || i.actualStatus === 'DAMAGED'
      ).length,
    },
  });

  // Notify Admins about discrepancy flags
  const discrepancies = audit.items.filter(
    (item) => item.actualStatus === 'MISSING' || item.actualStatus === 'DAMAGED'
  );

  if (discrepancies.length > 0) {
    // Find active Admin users to send notifications
    const admins = await prisma.user.findMany({
      where: {
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    });

    for (const item of discrepancies) {
      for (const admin of admins) {
        await createNotification({
          userId: admin.id,
          title: 'Audit Discrepancy Flagged',
          message: `Discrepancy flagged: Asset ${item.asset.assetTag} was marked ${item.actualStatus} during audit cycle ${audit.name}.`,
          type: 'AUDIT_DISCREPANCY_FLAGGED',
          category: 'ALERTS',
        });
      }
    }
  }

  return closedCycle;
};

module.exports = {
  listAuditsService,
  createAuditService,
  fetchAuditByIdService,
  verifyItemService,
  fetchDiscrepancyReportService,
  closeAuditCycleService,
};
