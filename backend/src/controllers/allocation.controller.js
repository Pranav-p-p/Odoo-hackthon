// =============================================================================
// controllers/allocation.controller.js — Asset Allocation (Module 2, Screen 5)
// Member 2 scope per ROLE_DISTRIBUTION.md.
//
// API_CONTRACT.md Module 2 endpoints implemented here:
//   GET   /api/v1/allocations
//   POST  /api/v1/allocations
//   PATCH /api/v1/allocations/:id/return
//
// Data model fields match DATABASE_SCHEMA.md model Allocation and model Asset exactly.
// =============================================================================

const prisma = require('../config/prisma');
const { createError } = require('../middleware/error.middleware');

// TODO (Member 4): createLog and createNotification are pending Member 4's implementation.
// Import paths match SYSTEM_ARCHITECTURE.md backend tree.
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
// GET /api/v1/allocations
// Query params: assetId, userId, status (ACTIVE | RETURNED | OVERDUE)
// Any authenticated user can call this.
// =============================================================================
const listAllocations = async (req, res, next) => {
  try {
    const { assetId, userId, status } = req.query;

    const where = {};

    if (assetId) {
      where.assetId = assetId;
    }
    if (userId) {
      where.userId = userId;
    }
    if (status) {
      // Validate enum string
      const validStatuses = ['ACTIVE', 'RETURNED', 'OVERDUE'];
      if (!validStatuses.includes(status)) {
        throw createError(
          400,
          'INVALID_STATUS',
          `Invalid status "${status}". Must be one of: ${validStatuses.join(', ')}.`
        );
      }
      where.status = status;
    }

    const allocations = await prisma.allocation.findMany({
      where,
      orderBy: { allocatedAt: 'desc' },
      include: {
        asset: {
          select: {
            id: true,
            assetTag: true,
            name: true,
            status: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            department: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: allocations,
    });
  } catch (err) {
    next(err);
  }
};

// =============================================================================
// POST /api/v1/allocations
// ASSET_MANAGER / ADMIN only.
// Body: { assetId, userId, expectedReturn? }
//
// Logic (WORKFLOW.md Section 5 - exact):
// 1. Look up the asset.
// 2. If status !== 'AVAILABLE':
//    - Find the current ACTIVE allocation for this asset.
//    - Query user name & department name.
//    - Return 409 Conflict with the exact required error shape for the ConflictBanner.
// 3. If status === 'AVAILABLE':
//    - Create Allocation status=ACTIVE & update asset status='ALLOCATED' (transaction).
//    - Create notification and activity log side effects.
// =============================================================================
const createAllocation = async (req, res, next) => {
  try {
    const { assetId, userId, expectedReturn } = req.body;

    if (!assetId || !userId) {
      throw createError(400, 'MISSING_FIELD', 'Both assetId and userId are required.');
    }

    // 1. Look up the asset
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      throw createError(404, 'NOT_FOUND', `Asset with id "${assetId}" not found.`);
    }

    // Validate user existence
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { department: true },
    });
    if (!targetUser) {
      throw createError(404, 'NOT_FOUND', `User with id "${userId}" not found.`);
    }

    // 2. Double-Allocation Conflict check
    if (asset.status !== 'AVAILABLE') {
      // Find the current active allocation to get details
      const activeAlloc = await prisma.allocation.findFirst({
        where: {
          assetId: assetId,
          status: 'ACTIVE',
        },
        include: {
          user: {
            include: {
              department: true,
            },
          },
        },
      });

      const holderName = activeAlloc?.user?.name || 'Unknown User';
      const holderDept = activeAlloc?.user?.department?.name || 'No Department';

      // Return exact required 409 Conflict shape for the ConflictBanner
      return res.status(409).json({
        success: false,
        error: {
          code: 'DOUBLE_ALLOCATION',
          message: 'Asset is already allocated',
          details: {
            currentHolder: {
              name: holderName,
              department: holderDept,
            },
            suggestTransfer: true,
          },
        },
      });
    }

    // 3. Happy Path: Asset is AVAILABLE. Run Prisma transaction.
    const expectedReturnDate = expectedReturn ? new Date(expectedReturn) : null;

    const [newAllocation] = await prisma.$transaction([
      prisma.allocation.create({
        data: {
          assetId,
          userId,
          status: 'ACTIVE',
          expectedReturn: expectedReturnDate,
        },
        include: {
          asset: {
            select: {
              id: true,
              assetTag: true,
              name: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.asset.update({
        where: { id: assetId },
        data: { status: 'ALLOCATED' },
      }),
    ]);

    // Side effect 1: Create notification for the assigned user (SHARED_ENUMS.md notification type ASSET_ASSIGNED)
    // createNotification(userId, title, message, type, category)
    await createNotification(
      userId,
      'Asset Assigned',
      `Asset ${newAllocation.asset.assetTag} (${newAllocation.asset.name}) has been assigned to you.`,
      'ASSET_ASSIGNED',
      'ALERTS'
    );

    // Side effect 2: Log activity
    // createLog(userId, action, entityType, entityId, details)
    await createLog(
      req.user.id,
      'ALLOCATION_CREATED',
      'Allocation',
      newAllocation.id,
      {
        assetId: newAllocation.assetId,
        assetTag: newAllocation.asset.assetTag,
        userId: newAllocation.userId,
        userName: newAllocation.user.name,
      }
    );

    res.status(201).json({
      success: true,
      data: newAllocation,
      message: `Asset ${newAllocation.asset.assetTag} allocated successfully.`,
    });
  } catch (err) {
    next(err);
  }
};

// =============================================================================
// PATCH /api/v1/allocations/:id/return
// ASSET_MANAGER / ADMIN only.
// Body: { returnCondition, returnNotes }
//
// Logic (WORKFLOW.md Section 5 - exact):
// 1. Look up the allocation.
// 2. Set allocation.status → RETURNED, returnedAt → now, returnCondition, returnNotes.
// 3. Set asset.status → AVAILABLE (transaction).
// 4. Create activity log side effect.
// =============================================================================
const returnAllocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { returnCondition, returnNotes } = req.body;

    if (!returnCondition) {
      throw createError(400, 'MISSING_FIELD', 'Return condition (Good/Fair/Damaged) is required.');
    }

    const allocation = await prisma.allocation.findUnique({
      where: { id },
    });

    if (!allocation) {
      throw createError(404, 'NOT_FOUND', `Allocation with id "${id}" not found.`);
    }

    if (allocation.status === 'RETURNED') {
      throw createError(400, 'ALREADY_RETURNED', 'This allocation has already been returned.');
    }

    // Perform transaction: close allocation and release asset
    const [updatedAllocation] = await prisma.$transaction([
      prisma.allocation.update({
        where: { id },
        data: {
          status: 'RETURNED',
          returnedAt: new Date(),
          returnCondition,
          returnNotes: returnNotes || null,
        },
        include: {
          asset: {
            select: {
              id: true,
              assetTag: true,
            },
          },
        },
      }),
      prisma.asset.update({
        where: { id: allocation.assetId },
        data: { status: 'AVAILABLE' },
      }),
    ]);

    // Side effect: Log activity
    await createLog(
      req.user.id,
      'ALLOCATION_RETURNED',
      'Allocation',
      updatedAllocation.id,
      {
        assetId: updatedAllocation.assetId,
        assetTag: updatedAllocation.asset.assetTag,
        returnCondition: updatedAllocation.returnCondition,
      }
    );

    res.status(200).json({
      success: true,
      data: updatedAllocation,
      message: `Asset ${updatedAllocation.asset.assetTag} marked as returned successfully.`,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listAllocations,
  createAllocation,
  returnAllocation,
};
