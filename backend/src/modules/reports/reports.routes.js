/**
 * reports.routes.js
 * Mounts Reports & Analytics endpoints under /api/v1/reports.
 */

const { Router } = require('express');
const { authenticate } = require('../../middleware/auth.middleware');
const {
  getUtilization,
  getMaintenanceFrequency,
  getIdleAssets,
  getMostUsed,
  getDueForMaintenance,
  getDepartmentAllocation,
  getBookingHeatmap,
  exportReport,
} = require('./reports.controller');

const router = Router();

// All reports are protected — require authentication.
router.use(authenticate);

router.get('/utilization', getUtilization);
router.get('/maintenance-frequency', getMaintenanceFrequency);
router.get('/idle-assets', getIdleAssets);
router.get('/most-used', getMostUsed);
router.get('/due-for-maintenance', getDueForMaintenance);
router.get('/department-allocation', getDepartmentAllocation);
router.get('/booking-heatmap', getBookingHeatmap);
router.get('/export', exportReport);

module.exports = router;
