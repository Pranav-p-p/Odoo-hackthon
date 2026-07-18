// =============================================================================
// controllers/asset.controller.js — Asset Core (Module 2, Screen 4)
// Member 2 scope per ROLE_DISTRIBUTION.md.
//
// API_CONTRACT.md Module 2 endpoints implemented here:
//   GET  /api/v1/assets
//   POST /api/v1/assets
//   GET  /api/v1/assets/:id
//   PATCH /api/v1/assets/:id
//
// Data model field names are taken verbatim from DATABASE_SCHEMA.md → model Asset.
// =============================================================================

const prisma = require('../config/prisma');
const { generateAssetTag } = require('../utils/assetTagGenerator');
const { createError } = require('../middleware/error.middleware');

// TODO (Member 4): createLog and createNotification are pending Member 4's implementation.
// Import paths match SYSTEM_ARCHITECTURE.md backend tree.
// When Member 4 delivers these files, these require() calls will resolve automatically.
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
// Valid AssetStatus values — frozen per SHARED_ENUMS.md.
// Used for query-param validation so invalid enum strings return 400, not a
// Prisma error that would look like a 500.
// =============================================================================
const VALID_ASSET_STATUSES = [
  'AVAILABLE',
  'ALLOCATED',
  'RESERVED',
  'UNDER_MAINTENANCE',
  'LOST',
  'RETIRED',
  'DISPOSED',
];

// =============================================================================
// GET /api/v1/assets
// Query params: status, departmentId, categoryId, location, search, isBookable,
//               page (default 1), limit (default 20)
// `search` matches assetTag OR serialNumber OR name (case-insensitive contains).
// Any authenticated user may call this — no role restriction per API_CONTRACT.md.
// =============================================================================
const listAssets = async (req, res, next) => {
  try {
    const {
      status,
      departmentId,
      categoryId,
      location,
      search,
      isBookable,
      page = '1',
      limit = '20',
    } = req.query;

    // ── Pagination ─────────────────────────────────────────────────────────────
    const pageNum  = Math.max(1, parseInt(page, 10)  || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip     = (pageNum - 1) * limitNum;

    // ── Build Prisma `where` filter ────────────────────────────────────────────
    const where = {};

    // status — validate against enum before passing to Prisma
    if (status) {
      if (!VALID_ASSET_STATUSES.includes(status)) {
        throw createError(
          400,
          'INVALID_STATUS',
          `Invalid status "${status}". Must be one of: ${VALID_ASSET_STATUSES.join(', ')}.`
        );
      }
      where.status = status;
    }

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (location) {
      // Partial match on location field (case-insensitive)
      where.location = { contains: location, mode: 'insensitive' };
    }

    if (isBookable !== undefined) {
      // Accept "true"/"false" string from query param
      where.isBookable = isBookable === 'true';
    }

    // search — matches assetTag OR serialNumber OR name (API_CONTRACT.md)
    if (search) {
      where.OR = [
        { assetTag:     { contains: search, mode: 'insensitive' } },
        { serialNumber: { contains: search, mode: 'insensitive' } },
        { name:         { contains: search, mode: 'insensitive' } },
      ];
    }

    // ── Query DB ───────────────────────────────────────────────────────────────
    const [assets, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          category:   { select: { id: true, name: true } },
          department: { select: { id: true, name: true } },
        },
      }),
      prisma.asset.count({ where }),
    ]);

    // ── Paginated success envelope (API_CONTRACT.md) ───────────────────────────
    res.status(200).json({
      success: true,
      data: assets,
      pagination: {
        page:  pageNum,
        limit: limitNum,
        total,
      },
    });
  } catch (err) {
    next(err);
  }
};

// =============================================================================
// POST /api/v1/assets
// ASSET_MANAGER only (enforced by role.middleware.js in routes file).
// assetTag is ALWAYS generated server-side — any client-supplied assetTag is
// silently ignored per the task specification.
// Default status: AVAILABLE (DATABASE_SCHEMA.md default).
// Side effect: createLog("ASSET_REGISTERED") — Member 4's utility.
// =============================================================================
const createAsset = async (req, res, next) => {
  try {
    const {
      // assetTag intentionally destructured and discarded — server always generates it
      assetTag: _ignoredClientTag,
      serialNumber,
      name,
      categoryId,
      departmentId,
      isBookable,
      acquisitionDate,
      acquisitionCost,
      condition,
      location,
      photoUrl,
    } = req.body;

    // ── Required field validation ──────────────────────────────────────────────
    if (!name || typeof name !== 'string' || name.trim() === '') {
      throw createError(400, 'MISSING_FIELD', 'Asset name is required.');
    }
    if (!categoryId) {
      throw createError(400, 'MISSING_FIELD', 'categoryId is required.');
    }

    // ── Generate server-side asset tag (assetTagGenerator.js) ─────────────────
    // generateAssetTag queries the current MAX assetTag, increments, and returns
    // the next AF-XXXX string. See utils/assetTagGenerator.js for full details.
    const assetTag = await generateAssetTag(prisma);

    // ── Build creation payload using exact DATABASE_SCHEMA.md field names ──────
    const assetData = {
      assetTag,
      name:          name.trim(),
      categoryId,
      status:        'AVAILABLE', // default per DATABASE_SCHEMA.md
      isBookable:    isBookable === true || isBookable === 'true' ? true : false,
    };

    // Optional fields — only include if provided (avoid overwriting DB defaults)
    if (serialNumber  !== undefined) assetData.serialNumber  = serialNumber;
    if (departmentId  !== undefined) assetData.departmentId  = departmentId || null;
    if (condition     !== undefined) assetData.condition     = condition;
    if (location      !== undefined) assetData.location      = location;
    if (photoUrl      !== undefined) assetData.photoUrl      = photoUrl;
    if (acquisitionCost !== undefined) assetData.acquisitionCost = Number(acquisitionCost);
    if (acquisitionDate !== undefined) {
      // Prisma expects a Date object for DateTime fields
      assetData.acquisitionDate = new Date(acquisitionDate);
    }

    // ── Persist ────────────────────────────────────────────────────────────────
    const newAsset = await prisma.asset.create({
      data: assetData,
      include: {
        category:   { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
      },
    });

    // ── Side effect: activity log (Member 4) ───────────────────────────────────
    // TODO (Member 4): createLog signature expected:
    //   createLog(userId, action, entityType, entityId, details)
    await createLog({
      prisma,
      userId: req.user.id,
      action: 'ASSET_REGISTERED',
      entityType: 'Asset',
      entityId: newAsset.id,
      details: { assetTag: newAsset.assetTag, name: newAsset.name, categoryId: newAsset.categoryId }
    });

    // ── 201 Created ────────────────────────────────────────────────────────────
    res.status(201).json({
      success: true,
      data:    newAsset,
      message: `Asset ${newAsset.assetTag} registered successfully.`,
    });
  } catch (err) {
    next(err);
  }
};

// =============================================================================
// GET /api/v1/assets/:id
// Returns full asset detail including:
//   - allocations (allocation history, newest first)
//   - maintenanceReqs (maintenance history, newest first)
// Both relation names match DATABASE_SCHEMA.md model Asset exactly.
// 404 with standard error envelope if asset not found.
// =============================================================================
const getAssetById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const asset = await prisma.asset.findUnique({
      where: { id },
      include: {
        // Core relations
        category:   { select: { id: true, name: true, description: true } },
        department: { select: { id: true, name: true } },

        // Allocation history — newest first (DATABASE_SCHEMA.md: allocations[])
        allocations: {
          orderBy: { allocatedAt: 'desc' },
          include: {
            user: { select: { id: true, name: true, email: true, departmentId: true } },
          },
        },

        // Maintenance history — newest first (DATABASE_SCHEMA.md: maintenanceReqs[])
        maintenanceReqs: {
          orderBy: { createdAt: 'desc' },
          include: {
            requestedBy: { select: { id: true, name: true, email: true } },
            technician:  { select: { id: true, name: true, email: true } },
          },
        },

        // Transfers associated with this asset
        transfers: {
          orderBy: { createdAt: 'desc' },
          include: {
            requestedBy: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!asset) {
      throw createError(404, 'NOT_FOUND', `Asset with id "${id}" not found.`);
    }

    res.status(200).json({
      success: true,
      data:    asset,
    });
  } catch (err) {
    next(err);
  }
};

// =============================================================================
// PATCH /api/v1/assets/:id
// ASSET_MANAGER only (enforced by role.middleware.js in routes file).
// Partial update — only provided fields are updated.
// assetTag and status are intentionally excluded from client-editable fields:
//   - assetTag is immutable once assigned (AF-XXXX is a permanent identifier).
//   - status transitions are driven by allocation/maintenance/audit workflows,
//     not direct edits, per API_CONTRACT.md.
// Side effect: createLog("ASSET_UPDATED") — Member 4's utility.
// =============================================================================
const updateAsset = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Confirm asset exists before attempting update
    const existing = await prisma.asset.findUnique({ where: { id } });
    if (!existing) {
      throw createError(404, 'NOT_FOUND', `Asset with id "${id}" not found.`);
    }

    // ── Whitelist editable fields per API_CONTRACT.md "Partial update of any
    //    editable asset field" — assetTag is deliberately excluded (immutable).
    const {
      serialNumber,
      name,
      categoryId,
      departmentId,
      isBookable,
      acquisitionDate,
      acquisitionCost,
      condition,
      location,
      photoUrl,
      status,
    } = req.body;

    const updateData = {};

    if (name          !== undefined) updateData.name          = name.trim();
    if (serialNumber  !== undefined) updateData.serialNumber  = serialNumber;
    if (categoryId    !== undefined) updateData.categoryId    = categoryId;
    if (departmentId  !== undefined) updateData.departmentId  = departmentId || null;
    if (isBookable    !== undefined) updateData.isBookable    = isBookable === true || isBookable === 'true';
    if (condition     !== undefined) updateData.condition     = condition;
    if (location      !== undefined) updateData.location      = location;
    if (photoUrl      !== undefined) updateData.photoUrl      = photoUrl;
    if (acquisitionCost !== undefined) updateData.acquisitionCost = Number(acquisitionCost);
    if (acquisitionDate !== undefined) {
      updateData.acquisitionDate = new Date(acquisitionDate);
    }

    // status — validate if provided
    if (status !== undefined) {
      if (!VALID_ASSET_STATUSES.includes(status)) {
        throw createError(
          400,
          'INVALID_STATUS',
          `Invalid status "${status}". Must be one of: ${VALID_ASSET_STATUSES.join(', ')}.`
        );
      }
      updateData.status = status;
    }

    if (Object.keys(updateData).length === 0) {
      throw createError(400, 'NO_FIELDS', 'No valid fields provided for update.');
    }

    // ── Persist partial update ─────────────────────────────────────────────────
    const updatedAsset = await prisma.asset.update({
      where: { id },
      data:  updateData,
      include: {
        category:   { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
      },
    });

    // ── Side effect: activity log (Member 4) ───────────────────────────────────
    // TODO (Member 4): createLog signature expected:
    //   createLog(userId, action, entityType, entityId, details)
    await createLog({
      prisma,
      userId: req.user.id,
      action: 'ASSET_UPDATED',
      entityType: 'Asset',
      entityId: updatedAsset.id,
      details: { changedFields: Object.keys(updateData), assetTag: updatedAsset.assetTag }
    });

    res.status(200).json({
      success: true,
      data:    updatedAsset,
      message: `Asset ${updatedAsset.assetTag} updated successfully.`,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listAssets,
  createAsset,
  getAssetById,
  updateAsset,
};
