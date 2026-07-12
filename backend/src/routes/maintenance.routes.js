// ============================================================================
// maintenance.routes.js — Member 3: Operations Module
// Endpoints: GET, POST /maintenance-requests + 5 PATCH status transitions
// API Contract: docs/API_CONTRACT.md — Module 3: Operations (Screen 7)
// Kanban status machine: PENDING_APPROVAL → APPROVED → TECHNICIAN_ASSIGNED
//                        → IN_PROGRESS → RESOLVED
// ============================================================================

import express from 'express';
import {
  getMaintenanceRequests,
  createMaintenanceRequest,
  approveRequest,
  rejectRequest,
  assignTechnician,
  startWork,
  resolveRequest,
} from '../controllers/maintenance.controller.js';

// TODO [MEMBER 1]: Uncomment these when auth.middleware.js is delivered
// import { authenticate } from '../middleware/auth.middleware.js';
// import { authorize }    from '../middleware/role.middleware.js';

const router = express.Router();

// Roles allowed to manage maintenance (approve/reject/assign/start/resolve)
// TODO [MEMBER 1]: const MANAGER_ROLES = ['ASSET_MANAGER', 'ADMIN'];

// GET /api/v1/maintenance-requests?status=...&assetId=...&priority=...
// Any authenticated user can view maintenance requests (to see Kanban board)
router.get(
  '/',
  // TODO [MEMBER 1]: authenticate,
  getMaintenanceRequests,
);

// POST /api/v1/maintenance-requests
// Any authenticated user can raise a maintenance request
router.post(
  '/',
  // TODO [MEMBER 1]: authenticate,
  createMaintenanceRequest,
);

// PATCH /api/v1/maintenance-requests/:id/approve
// ASSET_MANAGER only — sets status → APPROVED, asset → UNDER_MAINTENANCE
router.patch(
  '/:id/approve',
  // TODO [MEMBER 1]: authenticate, authorize(MANAGER_ROLES),
  approveRequest,
);

// PATCH /api/v1/maintenance-requests/:id/reject
// ASSET_MANAGER only — sets status → REJECTED
router.patch(
  '/:id/reject',
  // TODO [MEMBER 1]: authenticate, authorize(MANAGER_ROLES),
  rejectRequest,
);

// PATCH /api/v1/maintenance-requests/:id/assign
// ASSET_MANAGER only — sets technicianId, status → TECHNICIAN_ASSIGNED
router.patch(
  '/:id/assign',
  // TODO [MEMBER 1]: authenticate, authorize(MANAGER_ROLES),
  assignTechnician,
);

// PATCH /api/v1/maintenance-requests/:id/start
// ASSET_MANAGER only — sets status → IN_PROGRESS
router.patch(
  '/:id/start',
  // TODO [MEMBER 1]: authenticate, authorize(MANAGER_ROLES),
  startWork,
);

// PATCH /api/v1/maintenance-requests/:id/resolve
// ASSET_MANAGER only — sets status → RESOLVED, asset → AVAILABLE
router.patch(
  '/:id/resolve',
  // TODO [MEMBER 1]: authenticate, authorize(MANAGER_ROLES),
  resolveRequest,
);

export default router;
