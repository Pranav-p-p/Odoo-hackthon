/**
 * audit.routes.js
 * Mounts Audit endpoints under /api/v1/audits.
 */

const { Router } = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const { assetManagerOrAbove } = require('../middleware/role.middleware');
const { validate, schemas } = require('../middleware/validate.middleware');
const {
  getAudits,
  createAudit,
  getAuditById,
  verifyItem,
  getDiscrepancyReport,
  closeAudit,
} = require('../controllers/audit.controller');

const router = Router();

/**
 * GET /api/v1/audits
 * Lists audit cycles. Filter by status, departmentId.
 */
router.get('/', authenticate, getAudits);

/**
 * POST /api/v1/audits
 * Creates an audit cycle. Auto-populates items.
 * Requires: Admin or Asset Manager.
 */
router.post(
  '/',
  authenticate,
  assetManagerOrAbove,
  validate(schemas.createAudit),
  createAudit
);

/**
 * GET /api/v1/audits/:id
 * Fetches single audit cycle with all items.
 */
router.get('/:id', authenticate, getAuditById);

/**
 * GET /api/v1/audits/:id/discrepancy-report
 * Fetches discrepancy items (MISSING/DAMAGED) only.
 */
router.get('/:id/discrepancy-report', authenticate, getDiscrepancyReport);

/**
 * PATCH /api/v1/audits/:id/items/:itemId
 * Marks a specific item as verified, missing, or damaged.
 */
router.patch(
  '/:id/items/:itemId',
  authenticate,
  validate(schemas.updateAuditItem),
  verifyItem
);

/**
 * PATCH /api/v1/audits/:id/close
 * Closes the cycle and flags missing assets as LOST.
 * Requires: Admin or Asset Manager.
 */
router.patch('/:id/close', authenticate, assetManagerOrAbove, closeAudit);

module.exports = router;
