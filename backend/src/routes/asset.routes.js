// =============================================================================
// routes/asset.routes.js — Asset Core Routes (Module 2, Screen 4)
// Member 2 scope per ROLE_DISTRIBUTION.md.
//
// Mounts at: /api/v1/assets  (registered in server.js)
//
// Middleware used (Member 1's implementations — do NOT reimplement):
//   authenticate        — from auth.middleware.js (verifies JWT, attaches req.user)
//   assetManagerOrAbove — from role.middleware.js (ASSET_MANAGER + ADMIN)
//
// API_CONTRACT.md Module 2 endpoints:
//   GET  /api/v1/assets          — any authenticated user
//   POST /api/v1/assets          — ASSET_MANAGER or ADMIN only
//   GET  /api/v1/assets/:id      — any authenticated user
//   PATCH /api/v1/assets/:id     — ASSET_MANAGER or ADMIN only
// =============================================================================

const express = require('express');
const router  = express.Router();

// ── Member 1 middleware (blocking dependency — confirmed present) ──────────────
const { authenticate }        = require('../middleware/auth.middleware');
const { assetManagerOrAbove } = require('../middleware/role.middleware');

// ── Asset controller (Member 2) ───────────────────────────────────────────────
const {
  listAssets,
  createAsset,
  getAssetById,
  updateAsset,
} = require('../controllers/asset.controller');

// =============================================================================
// GET /api/v1/assets
// Query: status, departmentId, categoryId, location, search, isBookable, page, limit
// Auth: any authenticated user (no role restriction per API_CONTRACT.md)
// =============================================================================
router.get('/', authenticate, listAssets);

// =============================================================================
// POST /api/v1/assets
// Auth: ASSET_MANAGER or ADMIN
// Body: { serialNumber, name, categoryId, departmentId?, isBookable,
//         acquisitionDate?, acquisitionCost?, condition, location, photoUrl }
// NOTE: assetTag is generated server-side — client-supplied value is ignored.
// =============================================================================
router.post('/', authenticate, assetManagerOrAbove, createAsset);

// =============================================================================
// GET /api/v1/assets/:id
// Auth: any authenticated user
// Returns: full asset detail + allocation history + maintenance history
// =============================================================================
router.get('/:id', authenticate, getAssetById);

// =============================================================================
// PATCH /api/v1/assets/:id
// Auth: ASSET_MANAGER or ADMIN
// Body: partial update of any editable asset field
// =============================================================================
router.patch('/:id', authenticate, assetManagerOrAbove, updateAsset);

module.exports = router;
