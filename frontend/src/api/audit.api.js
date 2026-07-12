import apiClient from './authApi';

/**
 * GET /audits
 * Lists audit cycles. Filter by status, departmentId.
 */
export async function getAudits(params = {}) {
  const response = await apiClient.get('/audits', { params });
  return response.data;
}

/**
 * POST /audits
 * Creates an audit cycle and populates items.
 */
export async function createAudit(body) {
  const response = await apiClient.post('/audits', body);
  return response.data;
}

/**
 * GET /audits/:id
 * Fetches single audit cycle with all items.
 */
export async function getAuditById(id) {
  const response = await apiClient.get(`/audits/${id}`);
  return response.data;
}

/**
 * GET /audits/:id/discrepancy-report
 * Fetches discrepancy items (MISSING/DAMAGED) only.
 */
export async function getDiscrepancyReport(id) {
  const response = await apiClient.get(`/audits/${id}/discrepancy-report`);
  return response.data;
}

/**
 * PATCH /audits/:id/items/:itemId
 * Marks a specific item as verified, missing, or damaged.
 *
 * @param {string} auditId
 * @param {string} itemId
 * @param {Object} body - { actualStatus: 'VERIFIED'|'MISSING'|'DAMAGED', notes?: string }
 */
export async function verifyItem(auditId, itemId, body) {
  const response = await apiClient.patch(`/audits/${auditId}/items/${itemId}`, body);
  return response.data;
}

/**
 * PATCH /audits/:id/close
 * Closes the cycle and flags missing assets as LOST.
 */
export async function closeAudit(id) {
  const response = await apiClient.patch(`/audits/${id}/close`);
  return response.data;
}
