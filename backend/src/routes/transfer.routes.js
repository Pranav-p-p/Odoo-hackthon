// =============================================================================
// routes/transfer.routes.js — Asset Transfer Routes (Module 2, Screen 5)
// Member 2 scope per ROLE_DISTRIBUTION.md.
//
// Mounts at: /api/v1/transfers  (registered in server.js)
//
// Middleware used (Member 1's implementations):
//   authenticate        — from auth.middleware.js (verifies JWT, attaches req.user)
//   assetManagerOrAbove — from role.middleware.js (ASSET_MANAGER + ADMIN)
//
// API_CONTRACT.md Module 2 endpoints:
//   GET   /api/v1/transfers            — any authenticated user
//   POST  /api/v1/transfers            — any authenticated user
//   PATCH /api/v1/transfers/:id/approve — ASSET_MANAGER or ADMIN only
//   PATCH /api/v1/transfers/:id/reject  — ASSET_MANAGER or ADMIN only
// =============================================================================

const express = require('express');
const router  = express.Router();

// Middleware imports
const { authenticate }        = require('../middleware/auth.middleware');
const { assetManagerOrAbove } = require('../middleware/role.middleware');

// Controller functions
const {
  listTransfers,
  createTransfer,
  approveTransfer,
  rejectTransfer,
} = require('../controllers/transfer.controller');

// GET /api/v1/transfers — Any authenticated user
router.get('/', authenticate, listTransfers);

// POST /api/v1/transfers — Any authenticated user
router.post('/', authenticate, createTransfer);

// PATCH /api/v1/transfers/:id/approve — ASSET_MANAGER / ADMIN only
router.patch('/:id/approve', authenticate, assetManagerOrAbove, approveTransfer);

// PATCH /api/v1/transfers/:id/reject — ASSET_MANAGER / ADMIN only
router.patch('/:id/reject', authenticate, assetManagerOrAbove, rejectTransfer);

module.exports = router;
