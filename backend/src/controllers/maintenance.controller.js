// ============================================================================
// maintenance.controller.js — Member 3: Operations Module  [PHASE 4 — Auth wired]
// Screen 7 — Maintenance Management (Kanban Board)
// API Contract: docs/API_CONTRACT.md — Module 3 / Maintenance
// WORKFLOW.md: Section 7 — Maintenance Management Workflow
// Status machine:
//   PENDING_APPROVAL → APPROVED → TECHNICIAN_ASSIGNED → IN_PROGRESS → RESOLVED
//   PENDING_APPROVAL → REJECTED (terminal)
// ============================================================================

const prisma = require('../config/prisma');

// TODO [MEMBER 4]: Uncomment when utilities are delivered
// const { createLog }          = require('../utils/createLog');
// const { createNotification } = require('../utils/createNotification');

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/maintenance-requests
// Query: ?status=...&assetId=...&priority=...
// ─────────────────────────────────────────────────────────────────────────────
const getMaintenanceRequests = async (req, res, next) => {
  try {
    const { status, assetId, priority } = req.query;

    const where = {};
    if (status)   where.status   = status;
    if (assetId)  where.assetId  = assetId;
    if (priority) where.priority = priority;

    const requests = await prisma.maintenanceRequest.findMany({
      where,
      include: {
        asset: {
          select: { id: true, assetTag: true, name: true, status: true },
        },
        requestedBy: {
          select: { id: true, name: true },
        },
        technician: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      success: true,
      data:    requests,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/maintenance-requests
// Body: { assetId, issueDescription, priority, photoUrl? }
// Any authenticated user can raise a request
// Initial status: PENDING_APPROVAL
// ─────────────────────────────────────────────────────────────────────────────
const createMaintenanceRequest = async (req, res, next) => {
  try {
    const { assetId, issueDescription, priority, photoUrl } = req.body;

    // ── 1. Validate required fields ───────────────────────────────────────────
    if (!assetId || !issueDescription || !priority) {
      return res.status(400).json({
        success: false,
        error: {
          code:    'MISSING_FIELDS',
          message: 'assetId, issueDescription, and priority are required.',
        },
      });
    }

    // ── 2. Validate priority enum (SHARED_ENUMS.md: LOW | MEDIUM | HIGH | CRITICAL)
    const VALID_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    if (!VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({
        success: false,
        error: {
          code:    'INVALID_PRIORITY',
          message: `Priority must be one of: ${VALID_PRIORITIES.join(', ')}.`,
        },
      });
    }

    // ── 3. Verify asset exists ────────────────────────────────────────────────
    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) {
      return res.status(404).json({
        success: false,
        error: { code: 'ASSET_NOT_FOUND', message: 'Asset not found.' },
      });
    }

    // ── 4. Create maintenance request ─────────────────────────────────────────
    // req.user.id is now live — set by authenticate middleware
    const requestedById = req.user.id;

    const request = await prisma.maintenanceRequest.create({
      data: {
        assetId,
        requestedById,
        issueDescription,
        priority,
        photoUrl:  photoUrl ?? null,
        status:    'PENDING_APPROVAL',
      },
      include: {
        asset:       { select: { id: true, assetTag: true, name: true } },
        requestedBy: { select: { id: true, name: true } },
      },
    });

    // ── 5. Side effects ───────────────────────────────────────────────────────
    // TODO [MEMBER 4]:
    // await createLog(
    //   requestedById,
    //   'MAINTENANCE_REQUEST_CREATED',
    //   'MaintenanceRequest',
    //   request.id,
    //   { assetId, priority, issueDescription },
    // );

    return res.status(201).json({
      success: true,
      data:    request,
      message: 'Maintenance request raised successfully.',
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/v1/maintenance-requests/:id/approve
// ASSET_MANAGER + ADMIN only (enforced by assetManagerOrAbove in route)
// CRITICAL: Uses prisma.$transaction to atomically update BOTH request AND asset
// Status:  PENDING_APPROVAL → APPROVED
// Asset:   any             → UNDER_MAINTENANCE
// ─────────────────────────────────────────────────────────────────────────────
const approveRequest = async (req, res, next) => {
  try {
    const { id } = req.params;

    // ── 1. Find request ───────────────────────────────────────────────────────
    const request = await prisma.maintenanceRequest.findUnique({
      where: { id },
      include: {
        asset:       { select: { id: true, name: true, assetTag: true } },
        requestedBy: { select: { id: true, name: true } },
      },
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        error: { code: 'REQUEST_NOT_FOUND', message: 'Maintenance request not found.' },
      });
    }

    // ── 2. State guard ────────────────────────────────────────────────────────
    if (request.status !== 'PENDING_APPROVAL') {
      return res.status(400).json({
        success: false,
        error: {
          code:    'INVALID_STATE_TRANSITION',
          message: `Cannot approve a request with status "${request.status}". Must be PENDING_APPROVAL.`,
        },
      });
    }

    // ── 3. Atomic transaction — update BOTH request AND asset ─────────────────
    // WORKFLOW.md §7: "Auto-status update: Asset status → UNDER_MAINTENANCE on approval"
    const [updatedRequest] = await prisma.$transaction([
      prisma.maintenanceRequest.update({
        where: { id },
        data:  { status: 'APPROVED' },
        include: {
          asset:       { select: { id: true, assetTag: true, name: true, status: true } },
          requestedBy: { select: { id: true, name: true } },
          technician:  { select: { id: true, name: true } },
        },
      }),
      prisma.asset.update({
        where: { id: request.assetId },
        data:  { status: 'UNDER_MAINTENANCE' },  // SHARED_ENUMS.md: AssetStatus
      }),
    ]);

    // ── 4. Side effects ───────────────────────────────────────────────────────
    // TODO [MEMBER 4]: Uncomment when utilities are delivered
    // await createNotification(
    //   request.requestedById,
    //   'Maintenance Request Approved',
    //   `Your maintenance request for ${request.asset.name} (${request.asset.assetTag}) has been approved.`,
    //   'MAINTENANCE_APPROVED',  // SHARED_ENUMS.md Notification Types
    //   'APPROVALS',             // SHARED_ENUMS.md Notification Categories
    // );

    // TODO [MEMBER 4]:
    // await createLog(
    //   req.user.id,
    //   'MAINTENANCE_APPROVED',
    //   'MaintenanceRequest',
    //   id,
    //   { assetId: request.assetId, previousStatus: 'PENDING_APPROVAL' },
    // );

    return res.status(200).json({
      success: true,
      data:    updatedRequest,
      message: `Maintenance request approved. Asset "${request.asset.name}" is now UNDER_MAINTENANCE.`,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/v1/maintenance-requests/:id/reject
// ASSET_MANAGER + ADMIN only
// Body: { reason? }
// Status: PENDING_APPROVAL → REJECTED (terminal state)
// ─────────────────────────────────────────────────────────────────────────────
const rejectRequest = async (req, res, next) => {
  try {
    const { id }     = req.params;
    const { reason } = req.body;

    const request = await prisma.maintenanceRequest.findUnique({
      where: { id },
      include: {
        asset:       { select: { id: true, name: true, assetTag: true } },
        requestedBy: { select: { id: true, name: true } },
      },
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        error: { code: 'REQUEST_NOT_FOUND', message: 'Maintenance request not found.' },
      });
    }

    if (request.status !== 'PENDING_APPROVAL') {
      return res.status(400).json({
        success: false,
        error: {
          code:    'INVALID_STATE_TRANSITION',
          message: `Cannot reject a request with status "${request.status}". Must be PENDING_APPROVAL.`,
        },
      });
    }

    const updated = await prisma.maintenanceRequest.update({
      where: { id },
      data: {
        status:        'REJECTED',
        resolvedNotes: reason ?? null,  // store rejection reason in resolvedNotes field
      },
      include: {
        asset:       { select: { id: true, assetTag: true, name: true } },
        requestedBy: { select: { id: true, name: true } },
      },
    });

    // TODO [MEMBER 4]: Uncomment when utilities are delivered
    // await createNotification(
    //   request.requestedById,
    //   'Maintenance Request Rejected',
    //   `Your maintenance request for ${request.asset.name} has been rejected. Reason: ${reason ?? 'No reason provided.'}`,
    //   'MAINTENANCE_REJECTED',  // SHARED_ENUMS.md
    //   'APPROVALS',
    // );

    // TODO [MEMBER 4]:
    // await createLog(req.user.id, 'MAINTENANCE_REJECTED', 'MaintenanceRequest', id, { reason });

    return res.status(200).json({
      success: true,
      data:    updated,
      message: 'Maintenance request rejected.',
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/v1/maintenance-requests/:id/assign
// ASSET_MANAGER + ADMIN only
// Body: { technicianId }
// Status: APPROVED → TECHNICIAN_ASSIGNED
// ─────────────────────────────────────────────────────────────────────────────
const assignTechnician = async (req, res, next) => {
  try {
    const { id }           = req.params;
    const { technicianId } = req.body;

    if (!technicianId) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'technicianId is required.' },
      });
    }

    const request = await prisma.maintenanceRequest.findUnique({ where: { id } });
    if (!request) {
      return res.status(404).json({
        success: false,
        error: { code: 'REQUEST_NOT_FOUND', message: 'Maintenance request not found.' },
      });
    }

    if (request.status !== 'APPROVED') {
      return res.status(400).json({
        success: false,
        error: {
          code:    'INVALID_STATE_TRANSITION',
          message: `Cannot assign technician to a request with status "${request.status}". Must be APPROVED.`,
        },
      });
    }

    // Verify technician user exists
    const technician = await prisma.user.findUnique({
      where:  { id: technicianId },
      select: { id: true, name: true, status: true },
    });
    if (!technician) {
      return res.status(404).json({
        success: false,
        error: { code: 'TECHNICIAN_NOT_FOUND', message: 'Technician user not found.' },
      });
    }

    const updated = await prisma.maintenanceRequest.update({
      where: { id },
      data: {
        technicianId,
        status: 'TECHNICIAN_ASSIGNED',
      },
      include: {
        asset:       { select: { id: true, assetTag: true, name: true } },
        requestedBy: { select: { id: true, name: true } },
        technician:  { select: { id: true, name: true } },
      },
    });

    // TODO [MEMBER 4]:
    // await createLog(req.user.id, 'TECHNICIAN_ASSIGNED', 'MaintenanceRequest', id, { technicianId });

    return res.status(200).json({
      success: true,
      data:    updated,
      message: `Technician "${technician.name}" assigned successfully.`,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/v1/maintenance-requests/:id/start
// ASSET_MANAGER + ADMIN only
// Status: TECHNICIAN_ASSIGNED → IN_PROGRESS
// ─────────────────────────────────────────────────────────────────────────────
const startWork = async (req, res, next) => {
  try {
    const { id } = req.params;

    const request = await prisma.maintenanceRequest.findUnique({ where: { id } });
    if (!request) {
      return res.status(404).json({
        success: false,
        error: { code: 'REQUEST_NOT_FOUND', message: 'Maintenance request not found.' },
      });
    }

    if (request.status !== 'TECHNICIAN_ASSIGNED') {
      return res.status(400).json({
        success: false,
        error: {
          code:    'INVALID_STATE_TRANSITION',
          message: `Cannot start work on a request with status "${request.status}". Must be TECHNICIAN_ASSIGNED.`,
        },
      });
    }

    const updated = await prisma.maintenanceRequest.update({
      where: { id },
      data:  { status: 'IN_PROGRESS' },
      include: {
        asset:       { select: { id: true, assetTag: true, name: true } },
        requestedBy: { select: { id: true, name: true } },
        technician:  { select: { id: true, name: true } },
      },
    });

    // TODO [MEMBER 4]:
    // await createLog(req.user.id, 'MAINTENANCE_STARTED', 'MaintenanceRequest', id, {});

    return res.status(200).json({
      success: true,
      data:    updated,
      message: 'Maintenance work started.',
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/v1/maintenance-requests/:id/resolve
// ASSET_MANAGER + ADMIN only
// Body: { resolvedNotes }
// CRITICAL: Uses prisma.$transaction to atomically update BOTH request AND asset
// Status:  IN_PROGRESS → RESOLVED
// Asset:   UNDER_MAINTENANCE → AVAILABLE
// ─────────────────────────────────────────────────────────────────────────────
const resolveRequest = async (req, res, next) => {
  try {
    const { id }            = req.params;
    const { resolvedNotes } = req.body;

    if (!resolvedNotes) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'resolvedNotes is required.' },
      });
    }

    const request = await prisma.maintenanceRequest.findUnique({
      where: { id },
      include: {
        asset:       { select: { id: true, name: true, assetTag: true } },
        requestedBy: { select: { id: true, name: true } },
      },
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        error: { code: 'REQUEST_NOT_FOUND', message: 'Maintenance request not found.' },
      });
    }

    if (request.status !== 'IN_PROGRESS') {
      return res.status(400).json({
        success: false,
        error: {
          code:    'INVALID_STATE_TRANSITION',
          message: `Cannot resolve a request with status "${request.status}". Must be IN_PROGRESS.`,
        },
      });
    }

    // ── Atomic transaction — update BOTH request AND asset ────────────────────
    // WORKFLOW.md §7: "Auto-status update: Asset status → AVAILABLE on resolution"
    const [updatedRequest] = await prisma.$transaction([
      prisma.maintenanceRequest.update({
        where: { id },
        data:  { status: 'RESOLVED', resolvedNotes },
        include: {
          asset:       { select: { id: true, assetTag: true, name: true, status: true } },
          requestedBy: { select: { id: true, name: true } },
          technician:  { select: { id: true, name: true } },
        },
      }),
      prisma.asset.update({
        where: { id: request.assetId },
        data:  { status: 'AVAILABLE' },  // SHARED_ENUMS.md: AssetStatus
      }),
    ]);

    // TODO [MEMBER 4]: Uncomment when utilities are delivered
    // await createLog(
    //   req.user.id,
    //   'MAINTENANCE_RESOLVED',
    //   'MaintenanceRequest',
    //   id,
    //   { assetId: request.assetId, resolvedNotes },
    // );

    return res.status(200).json({
      success: true,
      data:    updatedRequest,
      message: `Maintenance resolved. Asset "${request.asset.name}" is now AVAILABLE.`,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMaintenanceRequests,
  createMaintenanceRequest,
  approveRequest,
  rejectRequest,
  assignTechnician,
  startWork,
  resolveRequest,
};
