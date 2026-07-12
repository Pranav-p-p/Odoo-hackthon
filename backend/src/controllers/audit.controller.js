/**
 * audit.controller.js
 * Receives requests, calls service, returns responses.
 * Delegates all errors to the global error handler via next(err).
 *
 * Standard response envelope per API_CONTRACT.md:
 *   Success: { success: true, data: {...}, message?: "..." }
 *   Error:   { success: false, error: { code, message, details } }
 */

const {
  listAuditsService,
  createAuditService,
  fetchAuditByIdService,
  verifyItemService,
  fetchDiscrepancyReportService,
  closeAuditCycleService,
} = require('../services/audit.service');

/**
 * GET /api/v1/audits
 * Query: status=OPEN|IN_PROGRESS|CLOSED, departmentId=uuid
 */
const getAudits = async (req, res, next) => {
  try {
    const audits = await listAuditsService(req.query);

    return res.status(200).json({
      success: true,
      data: audits,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/audits
 * Body: { name, departmentId?, locationScope?, auditorId, startDate, endDate }
 */
const createAudit = async (req, res, next) => {
  try {
    const audit = await createAuditService(req.body);

    return res.status(201).json({
      success: true,
      data: audit,
      message: 'Audit cycle successfully created with scoped items.',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/audits/:id
 */
const getAuditById = async (req, res, next) => {
  try {
    const audit = await fetchAuditByIdService(req.params.id);

    return res.status(200).json({
      success: true,
      data: audit,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/audits/:id/items/:itemId
 * Body: { actualStatus, notes }
 */
const verifyItem = async (req, res, next) => {
  try {
    const { id, itemId } = req.params;
    const { id: userId } = req.user;

    const item = await verifyItemService(id, itemId, req.body, userId);

    return res.status(200).json({
      success: true,
      data: item,
      message: 'Audit item successfully verified.',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/audits/:id/discrepancy-report
 */
const getDiscrepancyReport = async (req, res, next) => {
  try {
    const report = await fetchDiscrepancyReportService(req.params.id);

    return res.status(200).json({
      success: true,
      data: report,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/audits/:id/close
 */
const closeAudit = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { id: userId } = req.user;

    const audit = await closeAuditCycleService(id, userId);

    return res.status(200).json({
      success: true,
      data: audit,
      message: 'Audit cycle successfully closed. Discrepancies processed.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAudits,
  createAudit,
  getAuditById,
  verifyItem,
  getDiscrepancyReport,
  closeAudit,
};
