import apiClient from './authApi';

/**
 * GET /reports/utilization
 * Query: departmentId=uuid, period=week|month|quarter
 */
export async function getUtilization(params = {}) {
  const response = await apiClient.get('/reports/utilization', { params });
  return response.data;
}

/**
 * GET /reports/maintenance-frequency
 * Query: categoryId=uuid, period=...
 */
export async function getMaintenanceFrequency(params = {}) {
  const response = await apiClient.get('/reports/maintenance-frequency', { params });
  return response.data;
}

/**
 * GET /reports/idle-assets
 */
export async function getIdleAssets() {
  const response = await apiClient.get('/reports/idle-assets');
  return response.data;
}

/**
 * GET /reports/most-used
 */
export async function getMostUsed() {
  const response = await apiClient.get('/reports/most-used');
  return response.data;
}

/**
 * GET /reports/due-for-maintenance
 */
export async function getDueForMaintenance() {
  const response = await apiClient.get('/reports/due-for-maintenance');
  return response.data;
}

/**
 * GET /reports/department-allocation
 */
export async function getDepartmentAllocation() {
  const response = await apiClient.get('/reports/department-allocation');
  return response.data;
}

/**
 * GET /reports/booking-heatmap
 * Query: assetId=uuid
 */
export async function getBookingHeatmap(params = {}) {
  const response = await apiClient.get('/reports/booking-heatmap', { params });
  return response.data;
}

/**
 * GET /reports/export
 * Query: type=utilization|maintenance|allocation|booking
 * Returns Blob representing raw CSV data for download.
 */
export async function exportReport(type) {
  const response = await apiClient.get('/reports/export', {
    params: { type },
    responseType: 'blob',
  });
  return response.data; // Return the blob directly
}
