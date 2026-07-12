// ============================================================================
// bookingApi.js — Member 3: Frontend API layer for Resource Booking (Screen 6)
// Uses the shared Axios instance from authApi.js (JWT interceptor included)
// API Contract: docs/API_CONTRACT.md — Module 3 / Bookings
// ============================================================================

import apiClient from './authApi.js';

// ── Mock data (replace with live endpoint when Member 2 delivers GET /assets) ──
// SHARED_ENUMS.md: isBookable assets only
export const MOCK_BOOKABLE_ASSETS = [
  { id: 'mock-asset-1', name: 'Conference Room B2',  assetTag: 'AF-0012', isBookable: true },
  { id: 'mock-asset-2', name: 'Projector A1',        assetTag: 'AF-0015', isBookable: true },
  { id: 'mock-asset-3', name: 'Training Room 3',     assetTag: 'AF-0020', isBookable: true },
];

// ─────────────────────────────────────────────────────────────────────────────
// Fetch bookable assets
// Tries live GET /assets?isBookable=true first — falls back to mock if not ready.
// TODO [MEMBER 2]: Remove MOCK_BOOKABLE_ASSETS and the try/catch once /assets is live.
// ─────────────────────────────────────────────────────────────────────────────
export async function getBookableAssets() {
  try {
    const response = await apiClient.get('/assets', { params: { isBookable: true } });
    const assets = response.data?.data ?? [];
    // If the endpoint returns an empty array and the mock has data, prefer mock for demo
    return assets.length > 0 ? assets : MOCK_BOOKABLE_ASSETS;
  } catch {
    // Member 2's /assets endpoint not yet live — use mock data
    return MOCK_BOOKABLE_ASSETS;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/bookings
// Query: { assetId?, userId?, date?, status? }
// Returns list of bookings (with effective status computed by backend)
// ─────────────────────────────────────────────────────────────────────────────
export async function getBookings(params = {}) {
  const response = await apiClient.get('/bookings', { params });
  return response.data; // { success, data: Booking[] }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/bookings
// Body: { assetId, startTime (ISO8601), endTime (ISO8601), purpose? }
// Throws AxiosError with status 409 if overlap detected
// 409 error.response.data.error.details.conflictingBooking contains conflict info
// ─────────────────────────────────────────────────────────────────────────────
export async function createBooking({ assetId, startTime, endTime, purpose }) {
  const response = await apiClient.post('/bookings', {
    assetId,
    startTime,
    endTime,
    purpose: purpose ?? '',
  });
  return response.data; // { success, data: Booking, message }
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/v1/bookings/:id/cancel
// ─────────────────────────────────────────────────────────────────────────────
export async function cancelBooking(id) {
  const response = await apiClient.patch(`/bookings/${id}/cancel`);
  return response.data; // { success, data: Booking, message }
}
