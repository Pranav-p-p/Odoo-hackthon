import apiClient from './authApi';

/**
 * GET /activity-logs
 * Query: entityType, entityId, userId, page, limit
 */
export async function getActivityLogs(params = {}) {
  const response = await apiClient.get('/activity-logs', { params });
  return response.data;
}
