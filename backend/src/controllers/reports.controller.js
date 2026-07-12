/**
 * reports.controller.js
 * Receives requests, calls service, returns responses.
 * Delegates errors to global error handler via next(err).
 *
 * Standard response envelope per API_CONTRACT.md:
 *   Success: { success: true, data: {...}, message?: "..." }
 *   Error:   { success: false, error: { code, message, details } }
 */

const { createError } = require('../middleware/error.middleware');
const {
  fetchUtilization,
  fetchMaintenanceFrequency,
  fetchIdleAssets,
  fetchMostUsed,
  fetchDueForMaintenance,
  fetchDepartmentBreakdown,
  fetchBookingHeatmap,
  exportToCsv,
} = require('../services/reports.service');

/**
 * GET /api/v1/reports/utilization
 * Query: departmentId=uuid, period=week|month|quarter
 */
const getUtilization = async (req, res, next) => {
  try {
    const data = await fetchUtilization(req.query.departmentId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/reports/maintenance-frequency
 * Query: categoryId=uuid, period=...
 */
const getMaintenanceFrequency = async (req, res, next) => {
  try {
    const data = await fetchMaintenanceFrequency(req.query.categoryId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/reports/idle-assets
 */
const getIdleAssetsList = async (req, res, next) => {
  try {
    const data = await fetchIdleAssets();

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/reports/most-used
 */
const getMostUsedList = async (req, res, next) => {
  try {
    const data = await fetchMostUsed();

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/reports/due-for-maintenance
 */
const getDueForMaintenanceList = async (req, res, next) => {
  try {
    const data = await fetchDueForMaintenance();

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/reports/department-allocation
 */
const getDepartmentAllocation = async (req, res, next) => {
  try {
    const data = await fetchDepartmentBreakdown();

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/reports/booking-heatmap
 * Query: assetId=uuid
 */
const getBookingHeatmap = async (req, res, next) => {
  try {
    const data = await fetchBookingHeatmap(req.query.assetId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/reports/export
 * Query: type=utilization|maintenance|allocation|booking
 * Returns a downloadable CSV file attachment.
 */
const exportReport = async (req, res, next) => {
  try {
    const { type } = req.query;
    const validTypes = ['utilization', 'maintenance', 'allocation', 'booking'];

    if (!type || !validTypes.includes(type)) {
      throw createError(
        400,
        'INVALID_REPORT_TYPE',
        `Must specify a valid type: ${validTypes.join(', ')}`
      );
    }

    const { filename, csv } = await exportToCsv(type);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csv);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getUtilization,
  getMaintenanceFrequency,
  getIdleAssets: getIdleAssetsList,
  getMostUsed: getMostUsedList,
  getDueForMaintenance: getDueForMaintenanceList,
  getDepartmentAllocation,
  getBookingHeatmap,
  exportReport,
};
