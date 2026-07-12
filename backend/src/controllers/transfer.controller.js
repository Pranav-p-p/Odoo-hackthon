// =============================================================================
// controllers/transfer.controller.js — Asset Transfer (Module 2, Screen 5)
// Member 2 scope per ROLE_DISTRIBUTION.md.
//
// API_CONTRACT.md Module 2 endpoints implemented here:
//   GET   /api/v1/transfers
//   POST  /api/v1/transfers
//   PATCH /api/v1/transfers/:id/approve
//   PATCH /api/v1/transfers/:id/reject
//
// Data model fields match DATABASE_SCHEMA.md model Transfer exactly.
// =============================================================================

const prisma = require('../config/prisma');
const { createError } = require('../middleware/error.middleware');

// TODO (Member 4): createLog and createNotification are pending Member 4's implementation.
let createLog;
let createNotification;
try {
  ({ createLog } = require('../utils/createLog'));
} catch {
  // Member 4's utility not yet delivered — no-op stub so controller still runs.
  createLog = async (...args) => {
    console.warn('[TODO Member 4] createLog called but utils/createLog.js not yet available:', ...args);
  };
}
try {
  ({ createNotification } = require('../utils/createNotification'));
} catch {
  // Member 4's utility not yet delivered — no-op stub so controller still runs.
  createNotification = async (...args) => {
    console.warn('[TODO Member 4] createNotification called but utils/createNotification.js not yet available:', ...args);
  };
}

// =============================================================================
// GET /api/v1/transfers
// Query params: status, assetId
// Any authenticated user can call this.
// =============================================================================
const listTransfers = async (req, res, next) => {
  try {
    const { status, assetId } = req.query;

    const where = {};
    if (status) {
      const validStatuses = ['REQUESTED', 'APPROVED', 'REJECTED', 'COMPLETED'];
      if (!validStatuses.includes(status)) {
        throw createError(
          400,
          'INVALID_STATUS',
          `Invalid status "${status}". Must be one of: ${validStatuses.join(', ')}.`
        );
      }
      where.status = status;
    }
    if (assetId) {
      where.assetId = assetId;
    }

    const transfers = await prisma.transfer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        asset: {
          select: {
            id: true,
            assetTag: true,
            name: true,
          },
        },
        fromUser: { select: { id: true, name: true, email: true } },
        toUser:   { select: { id: true, name: true, email: true } },
        requestedBy: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(200).json({
      success: true,
      data: transfers,
    });
  } catch (err) {
    next(err);
  }
};

// =============================================================================
// POST /api/v1/transfers
// Any authenticated user can request a transfer.
// Body: { assetId, toUserId?, toDeptId, reason }
//
// Logic:
// - fromUserId and fromDeptId are auto-populated from the asset's current ACTIVE allocation.
// - If no active allocation exists, throw a 400 Bad Request (cannot transfer an unallocated asset).
// - requestedById comes from req.user.id.
// - Initial status defaults to REQUESTED.
// =============================================================================
const createTransfer = async (req, res, next) => {
  try {
    const { assetId, toUserId, toDeptId, reason } = req.body;

    if (!assetId) {
      throw createError(400, 'MISSING_FIELD', 'assetId is required.');
    }

    let targetDeptId = toDeptId;

    if (!targetDeptId && !toUserId) {
      throw createError(400, 'MISSING_FIELD', 'Either toDeptId or toUserId is required.');
    }

    // Resolve targetDeptId from toUserId if not provided directly
    if (toUserId) {
      const recipientUser = await prisma.user.findUnique({
        where: { id: toUserId },
      });
      if (!recipientUser) {
        throw createError(404, 'NOT_FOUND', `Target user with id "${toUserId}" does not exist.`);
      }
      if (!targetDeptId) {
        if (!recipientUser.departmentId) {
          throw createError(
            400,
            'USER_NO_DEPARTMENT',
            `Target user "${recipientUser.name}" has no department assigned. Transfers require a department.`
          );
        }
        targetDeptId = recipientUser.departmentId;
      }
    }

    // Lookup asset
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
    });
    if (!asset) {
      throw createError(404, 'NOT_FOUND', `Asset with id "${assetId}" not found.`);
    }

    // Lookup the asset's current ACTIVE allocation to populate fromUserId/fromDeptId
    const activeAlloc = await prisma.allocation.findFirst({
      where: {
        assetId: assetId,
        status: 'ACTIVE',
      },
      include: {
        user: true,
      },
    });

    if (!activeAlloc) {
      throw createError(
        400,
        'NO_ACTIVE_ALLOCATION',
        'Cannot request transfer for an asset that has no active allocation. Allocate it directly instead.'
      );
    }

    const fromUserId = activeAlloc.userId;
    const fromDeptId = activeAlloc.user.departmentId;

    // Verify targetDeptId existence
    const deptExists = await prisma.department.findUnique({
      where: { id: targetDeptId },
    });
    if (!deptExists) {
      throw createError(404, 'NOT_FOUND', `Target department with id "${targetDeptId}" does not exist.`);
    }

    const newTransfer = await prisma.transfer.create({
      data: {
        assetId,
        fromUserId,
        fromDeptId,
        toUserId: toUserId || null,
        toDeptId: targetDeptId,
        requestedById: req.user.id,
        status: 'REQUESTED',
        reason: reason || null,
      },
      include: {
        asset: { select: { id: true, assetTag: true, name: true } },
        requestedBy: { select: { id: true, name: true } },
      },
    });

    res.status(201).json({
      success: true,
      data: newTransfer,
      message: 'Transfer request submitted successfully.',
    });
  } catch (err) {
    next(err);
  }
};

// =============================================================================
// PATCH /api/v1/transfers/:id/approve
// ASSET_MANAGER / ADMIN only.
//
// Logic (WORKFLOW.md Section 5 - transaction):
// 1. Fetch transfer details. Validate status is REQUESTED.
// 2. Locate active allocation for transfer.assetId.
// 3. Perform Transaction:
//    - Close old active allocation (status -> RETURNED, returnedAt -> now).
//    - Create a new Allocation if toUserId is provided (status -> ACTIVE).
//    - Update asset.departmentId -> transfer.toDeptId (asset status remains ALLOCATED).
//    - Set transfer.status -> COMPLETED (representing approved & finalized), approvedById -> req.user.id.
// 4. Create notification "TRANSFER_APPROVED" (APPROVALS category) for the requester.
// 5. Create activity log "TRANSFER_APPROVED".
// =============================================================================
const approveTransfer = async (req, res, next) => {
  try {
    const { id } = req.params;

    const transfer = await prisma.transfer.findUnique({
      where: { id },
      include: {
        asset: true,
      },
    });

    if (!transfer) {
      throw createError(404, 'NOT_FOUND', `Transfer request with id "${id}" not found.`);
    }

    if (transfer.status !== 'REQUESTED') {
      throw createError(
        400,
        'INVALID_STATUS_TRANSITION',
        `Cannot approve transfer request in "${transfer.status}" status.`
      );
    }

    // Find the current active allocation for this asset
    const activeAlloc = await prisma.allocation.findFirst({
      where: {
        assetId: transfer.assetId,
        status: 'ACTIVE',
      },
    });

    if (!activeAlloc) {
      throw createError(
        409,
        'NO_ACTIVE_ALLOCATION',
        'Cannot execute transfer because the asset has no active allocation to close.'
      );
    }

    // Run sequential transaction to satisfy database trigger constraints
    const completedTransfer = await prisma.$transaction(async (tx) => {
      // 1. Close old allocation
      await tx.allocation.update({
        where: { id: activeAlloc.id },
        data: {
          status: 'RETURNED',
          returnedAt: new Date(),
          returnCondition: 'Good',
          returnNotes: `Transferred via Transfer Request ${transfer.id}.`,
        },
      });

      // 2. Temporarily set asset status to AVAILABLE to satisfy pg trigger fn_prevent_double_allocation
      await tx.asset.update({
        where: { id: transfer.assetId },
        data: { status: 'AVAILABLE' },
      });

      // 3. Create new allocation (only if toUserId is specified)
      if (transfer.toUserId) {
        await tx.allocation.create({
          data: {
            assetId: transfer.assetId,
            userId: transfer.toUserId,
            status: 'ACTIVE',
          },
        });
      }

      // 4. Update asset to its final status ALLOCATED and set target department
      await tx.asset.update({
        where: { id: transfer.assetId },
        data: {
          departmentId: transfer.toDeptId,
          status: 'ALLOCATED',
        },
      });

      // 5. Update transfer status
      return await tx.transfer.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          approvedById: req.user.id,
        },
      });
    });

    // Side effect 1: Create notification for the requester
    await createNotification(
      transfer.requestedById,
      'Transfer Approved',
      `Your transfer request for asset ${transfer.asset.assetTag} has been approved and completed.`,
      'TRANSFER_APPROVED',
      'APPROVALS'
    );

    // Side effect 2: Log activity
    await createLog(
      req.user.id,
      'TRANSFER_APPROVED',
      'Transfer',
      completedTransfer.id,
      {
        assetId: transfer.assetId,
        assetTag: transfer.asset.assetTag,
        fromUserId: transfer.fromUserId,
        toUserId: transfer.toUserId,
        toDeptId: transfer.toDeptId,
      }
    );

    res.status(200).json({
      success: true,
      data: completedTransfer,
      message: 'Transfer request approved and executed successfully.',
    });
  } catch (err) {
    next(err);
  }
};

// =============================================================================
// PATCH /api/v1/transfers/:id/reject
// ASSET_MANAGER / ADMIN only.
// Body: { reason }
//
// Logic:
// 1. Fetch transfer details. Validate status is REQUESTED.
// 2. Update status -> REJECTED.
// 3. Create notification "TRANSFER_REJECTED" (APPROVALS category) for the requester.
// 4. Create activity log "TRANSFER_REJECTED".
// =============================================================================
const rejectTransfer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || typeof reason !== 'string' || reason.trim() === '') {
      throw createError(400, 'MISSING_FIELD', 'Reason for rejection is required.');
    }

    const transfer = await prisma.transfer.findUnique({
      where: { id },
      include: { asset: true },
    });

    if (!transfer) {
      throw createError(404, 'NOT_FOUND', `Transfer request with id "${id}" not found.`);
    }

    if (transfer.status !== 'REQUESTED') {
      throw createError(
        400,
        'INVALID_STATUS_TRANSITION',
        `Cannot reject transfer request in "${transfer.status}" status.`
      );
    }

    const rejectedTransfer = await prisma.transfer.update({
      where: { id },
      data: {
        status: 'REJECTED',
        reason: reason.trim(),
      },
    });

    // Side effect 1: Create notification for the requester
    await createNotification(
      transfer.requestedById,
      'Transfer Rejected',
      `Your transfer request for asset ${transfer.asset.assetTag} was rejected. Reason: ${reason}`,
      'TRANSFER_REJECTED',
      'APPROVALS'
    );

    // Side effect 2: Log activity
    await createLog(
      req.user.id,
      'TRANSFER_REJECTED',
      'Transfer',
      rejectedTransfer.id,
      {
        assetId: transfer.assetId,
        assetTag: transfer.asset.assetTag,
        reason: rejectedTransfer.reason,
      }
    );

    res.status(200).json({
      success: true,
      data: rejectedTransfer,
      message: 'Transfer request rejected successfully.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listTransfers,
  createTransfer,
  approveTransfer,
  rejectTransfer,
};
