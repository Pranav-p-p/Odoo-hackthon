// =============================================================================
// routes/allocation.routes.js — Asset Allocation Routes (Module 2, Screen 5)
// Member 2 scope per ROLE_DISTRIBUTION.md.
//
// Mounts at: /api/v1/allocations  (registered in server.js)
//
// Middleware used (Member 1's implementations):
//   authenticate        — from auth.middleware.js (verifies JWT, attaches req.user)
//   assetManagerOrAbove — from role.middleware.js (ASSET_MANAGER + ADMIN)
//
// API_CONTRACT.md Module 2 endpoints:
//   GET   /api/v1/allocations          — any authenticated user
//   POST  /api/v1/allocations          — ASSET_MANAGER or ADMIN only
//   PATCH /api/v1/allocations/:id/return — ASSET_MANAGER or ADMIN only
// =============================================================================

const express = require('express');
const router  = express.Router();

// Middleware imports
const { authenticate }        = require('../middleware/auth.middleware');
const { assetManagerOrAbove } = require('../middleware/role.middleware');

// Controller functions
const {
  listAllocations,
  createAllocation,
  returnAllocation,
} = require('../controllers/allocation.controller');

// GET /api/v1/allocations — Any authenticated user
router.get('/', authenticate, listAllocations);

// POST /api/v1/allocations — ASSET_MANAGER / ADMIN only
router.post('/', authenticate, assetManagerOrAbove, createAllocation);

// PATCH /api/v1/allocations/:id/return — ASSET_MANAGER / ADMIN only
router.patch('/:id/return', authenticate, assetManagerOrAbove, returnAllocation);

module.exports = router;
