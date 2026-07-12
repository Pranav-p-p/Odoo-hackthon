// ============================================================================
// booking.routes.js — Member 3: Operations Module  [PHASE 4 — Auth wired]
// Endpoints: GET /bookings, POST /bookings, PATCH /bookings/:id/cancel
// API Contract: docs/API_CONTRACT.md — Module 3: Operations (Screen 6)
// ============================================================================

const express = require('express');
const { getBookings, createBooking, cancelBooking } = require('../controllers/booking.controller');
const { authenticate }        = require('../middleware/auth.middleware');
const { anyAuthenticatedUser } = require('../middleware/role.middleware');

const router = express.Router();

// GET /api/v1/bookings?assetId=...&userId=...&date=ISO8601&status=...
// Any authenticated user — needed for calendar display
router.get('/', authenticate, anyAuthenticatedUser, getBookings);

// POST /api/v1/bookings
// Any authenticated user can book an isBookable asset
// Returns 409 + conflictingBooking details on time-slot overlap
router.post('/', authenticate, anyAuthenticatedUser, createBooking);

// PATCH /api/v1/bookings/:id/cancel
// Owner of booking OR Asset Manager / Admin — ownership checked inside controller
router.patch('/:id/cancel', authenticate, anyAuthenticatedUser, cancelBooking);

module.exports = router;
