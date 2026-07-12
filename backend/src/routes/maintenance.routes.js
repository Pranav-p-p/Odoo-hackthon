// ============================================================================
// maintenance.routes.js — Member 3: Operations Module  [PHASE 4 — Auth wired]
// Endpoints: GET, POST /maintenance-requests + 5 PATCH status transitions
// API Contract: docs/API_CONTRACT.md — Module 3: Operations (Screen 7)
// Kanban status machine:
//   PENDING_APPROVAL → APPROVED → TECHNICIAN_ASSIGNED → IN_PROGRESS → RESOLVED
//   PENDING_APPROVAL → REJECTED (terminal)
// ============================================================================

const express = require('express');
const {
  getMaintenanceRequests,
  createMaintenanceRequest,
  approveRequest,
  rejectRequest,
  assignTechnician,
  startWork,
  resolveRequest,
} = require('../controllers/maintenance.controller');
const { authenticate }           = require('../middleware/auth.middleware');
const { anyAuthenticatedUser, assetManagerOrAbove } = require('../middleware/role.middleware');

const router = express.Router();

// GET /api/v1/maintenance-requests?status=...&assetId=...&priority=...
// Any authenticated user can view the Kanban board
router.get('/', authenticate, anyAuthenticatedUser, getMaintenanceRequests);

// POST /api/v1/maintenance-requests
// Any authenticated user can raise a maintenance request
router.post('/', authenticate, anyAuthenticatedUser, createMaintenanceRequest);

// PATCH /api/v1/maintenance-requests/:id/approve
// ASSET_MANAGER + ADMIN only — sets status → APPROVED, asset → UNDER_MAINTENANCE
router.patch('/:id/approve', authenticate, assetManagerOrAbove, approveRequest);

// PATCH /api/v1/maintenance-requests/:id/reject
// ASSET_MANAGER + ADMIN only — sets status → REJECTED (terminal)
router.patch('/:id/reject', authenticate, assetManagerOrAbove, rejectRequest);

// PATCH /api/v1/maintenance-requests/:id/assign
// ASSET_MANAGER + ADMIN only — sets technicianId, status → TECHNICIAN_ASSIGNED
router.patch('/:id/assign', authenticate, assetManagerOrAbove, assignTechnician);

// PATCH /api/v1/maintenance-requests/:id/start
// ASSET_MANAGER + ADMIN only — sets status → IN_PROGRESS
router.patch('/:id/start', authenticate, assetManagerOrAbove, startWork);

// PATCH /api/v1/maintenance-requests/:id/resolve
// ASSET_MANAGER + ADMIN only — sets status → RESOLVED, asset → AVAILABLE
router.patch('/:id/resolve', authenticate, assetManagerOrAbove, resolveRequest);

module.exports = router;
