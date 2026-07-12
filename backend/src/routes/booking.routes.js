// ============================================================================
// booking.routes.js — Member 3: Operations Module
// Endpoints: GET /bookings, POST /bookings, PATCH /bookings/:id/cancel
// API Contract: docs/API_CONTRACT.md — Module 3: Operations (Screen 6)
// ============================================================================

import express from 'express';
import {
  getBookings,
  createBooking,
  cancelBooking,
} from '../controllers/booking.controller.js';

// TODO [MEMBER 1]: Uncomment these when auth.middleware.js is delivered
// import { authenticate } from '../middleware/auth.middleware.js';
// import { authorize }    from '../middleware/role.middleware.js';

const router = express.Router();

// GET /api/v1/bookings?assetId=...&userId=...&date=ISO8601&status=...
// Any authenticated user can view bookings (for calendar display)
router.get(
  '/',
  // TODO [MEMBER 1]: authenticate,
  getBookings,
);

// POST /api/v1/bookings
// Any authenticated user can create a booking on an isBookable asset
// Returns 409 with conflictingBooking details if time slot overlaps
router.post(
  '/',
  // TODO [MEMBER 1]: authenticate,
  createBooking,
);

// PATCH /api/v1/bookings/:id/cancel
// Owner of booking OR Asset Manager / Admin can cancel
router.patch(
  '/:id/cancel',
  // TODO [MEMBER 1]: authenticate,
  cancelBooking,
);

export default router;
