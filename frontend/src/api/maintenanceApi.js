// ============================================================================
// maintenanceApi.js — Member 3: Frontend API layer for Maintenance (Screen 7)
// Uses the shared Axios instance from authApi.js (JWT interceptor included)
// API Contract: docs/API_CONTRACT.md — Module 3 / Maintenance
// ============================================================================

import apiClient from './authApi.js';

// ── Mock data for asset dropdown (replace when Member 2 delivers GET /assets) ─
export const MOCK_ASSETS = [
  { id: 'mock-asset-1', name: 'Conference Room B2',  assetTag: 'AF-0012' },
  { id: 'mock-asset-2', name: 'Dell Laptop',         assetTag: 'AF-0014' },
  { id: 'mock-asset-3', name: 'Projector A1',        assetTag: 'AF-0015' },
];

// ── Mock users for technician dropdown (replace when Member 1 delivers GET /users) ─
export const MOCK_USERS = [
  { id: 'mock-user-1', name: 'Rahul Verma',  role: 'ASSET_MANAGER' },
  { id: 'mock-user-2', name: 'Sneha Pillai', role: 'EMPLOYEE' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Fetch assets for the raise-request dropdown
// TODO [MEMBER 2]: Swap to live GET /assets when ready
// ─────────────────────────────────────────────────────────────────────────────
export async function getAssets() {
  try {
    // TODO [MEMBER 2]: Uncomment when asset endpoint is live
    // const response = await apiClient.get('/assets');
    // return response.data.data;
    return MOCK_ASSETS;
  } catch {
    return MOCK_ASSETS;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Fetch users for technician assignment dropdown
// TODO [MEMBER 1]: Swap to live GET /users when ready
// ─────────────────────────────────────────────────────────────────────────────
export async function getUsers() {
  try {
    // TODO [MEMBER 1]: Uncomment when user endpoint is live
    // const response = await apiClient.get('/users');
    // return response.data.data;
    return MOCK_USERS;
  } catch {
    return MOCK_USERS;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/maintenance-requests
// Query: { status?, assetId?, priority? }
// ─────────────────────────────────────────────────────────────────────────────
export async function getMaintenanceRequests(params = {}) {
  const response = await apiClient.get('/maintenance-requests', { params });
  return response.data; // { success, data: MaintenanceRequest[] }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/maintenance-requests
// Body: { assetId, issueDescription, priority, photoUrl? }
// priority must be: LOW | MEDIUM | HIGH | CRITICAL (SHARED_ENUMS.md)
// ─────────────────────────────────────────────────────────────────────────────
export async function createMaintenanceRequest({ assetId, issueDescription, priority, photoUrl }) {
  const response = await apiClient.post('/maintenance-requests', {
    assetId,
    issueDescription,
    priority,
    photoUrl: photoUrl ?? null,
  });
  return response.data; // { success, data: MaintenanceRequest, message }
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/v1/maintenance-requests/:id/approve
// Asset Manager only — sets status → APPROVED, asset → UNDER_MAINTENANCE
// ─────────────────────────────────────────────────────────────────────────────
export async function approveRequest(id) {
  const response = await apiClient.patch(`/maintenance-requests/${id}/approve`);
  return response.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/v1/maintenance-requests/:id/reject
// Asset Manager only — sets status → REJECTED
// ─────────────────────────────────────────────────────────────────────────────
export async function rejectRequest(id, reason = '') {
  const response = await apiClient.patch(`/maintenance-requests/${id}/reject`, { reason });
  return response.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/v1/maintenance-requests/:id/assign
// Asset Manager only — sets technicianId, status → TECHNICIAN_ASSIGNED
// ─────────────────────────────────────────────────────────────────────────────
export async function assignTechnician(id, technicianId) {
  const response = await apiClient.patch(`/maintenance-requests/${id}/assign`, { technicianId });
  return response.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/v1/maintenance-requests/:id/start
// Asset Manager only — sets status → IN_PROGRESS
// ─────────────────────────────────────────────────────────────────────────────
export async function startWork(id) {
  const response = await apiClient.patch(`/maintenance-requests/${id}/start`);
  return response.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/v1/maintenance-requests/:id/resolve
// Asset Manager only — sets status → RESOLVED, asset → AVAILABLE
// ─────────────────────────────────────────────────────────────────────────────
export async function resolveRequest(id, resolvedNotes) {
  const response = await apiClient.patch(`/maintenance-requests/${id}/resolve`, { resolvedNotes });
  return response.data;
}
