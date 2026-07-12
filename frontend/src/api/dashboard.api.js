import apiClient from './authApi';

/**
 * GET /dashboard/kpi
 * Returns the counts for the dashboard statistics cards.
 */
export async function getKpi() {
  const response = await apiClient.get('/dashboard/kpi');
  return response.data;
}

/**
 * GET /dashboard/recent-activity
 * Returns the latest 10 activity log entries.
 */
export async function getRecentActivity() {
  const response = await apiClient.get('/dashboard/recent-activity');
  return response.data;
}
