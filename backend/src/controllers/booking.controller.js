// ============================================================================
// booking.controller.js — Member 3: Operations Module  [PHASE 4 — Auth wired]
// Screen 6 — Resource Booking
// API Contract: docs/API_CONTRACT.md — Module 3 / Bookings
// WORKFLOW.md: Section 6 — Resource Booking Workflow
// ============================================================================

const prisma = require('../config/prisma');

const { createLog }          = require('../utils/createLog');
const { createNotification } = require('../utils/createNotification');

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compute effective booking status based on current time.
 * Bookings auto-transition: UPCOMING → ONGOING → COMPLETED
 * This is read-only display logic; we don't persist the transition here.
 * (Per WORKFLOW.md §11 — can be upgraded to a cron job later)
 */
function computeEffectiveStatus(booking) {
  if (booking.status === 'CANCELLED' || booking.status === 'COMPLETED') {
    return booking.status;
  }
  const now   = new Date();
  const start = new Date(booking.startTime);
  const end   = new Date(booking.endTime);

  if (now >= end)   return 'COMPLETED';
  if (now >= start) return 'ONGOING';
  return 'UPCOMING';
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/bookings
// Query: ?assetId=...&userId=...&date=ISO8601&status=...
// ─────────────────────────────────────────────────────────────────────────────
const getBookings = async (req, res, next) => {
  try {
    const { assetId, userId, date, status } = req.query;

    const where = {};
    if (assetId) where.assetId = assetId;
    if (userId)  where.userId  = userId;
    if (status)  where.status  = status;

    // If a date is provided, filter bookings that overlap that calendar day
    if (date) {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      // Booking overlaps the day if startTime < dayEnd AND endTime > dayStart
      where.startTime = { lt: dayEnd };
      where.endTime   = { gt: dayStart };
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        asset: {
          select: { id: true, assetTag: true, name: true, isBookable: true },
        },
        user: {
          select: { id: true, name: true },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    // Compute effective display status based on current time
    const withEffectiveStatus = bookings.map((b) => ({
      ...b,
      status: computeEffectiveStatus(b),
    }));

    return res.status(200).json({
      success: true,
      data: withEffectiveStatus,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/bookings
// Body: { assetId, startTime, endTime, purpose? }
// Returns 409 with conflictingBooking if overlap detected
// ─────────────────────────────────────────────────────────────────────────────
const createBooking = async (req, res, next) => {
  try {
    const { assetId, startTime, endTime, purpose } = req.body;

    // ── 1. Basic validation ───────────────────────────────────────────────────
    if (!assetId || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        error: {
          code:    'MISSING_FIELDS',
          message: 'assetId, startTime, and endTime are required.',
        },
      });
    }

    const start = new Date(startTime);
    const end   = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_DATE', message: 'startTime and endTime must be valid ISO 8601 dates.' },
      });
    }

    if (end <= start) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_TIME_RANGE', message: 'endTime must be after startTime.' },
      });
    }

    // Min 15 minutes (SHARED_ENUMS.md: BOOKING_MIN_DURATION_MINUTES = 15)
    const durationMinutes = (end - start) / 1000 / 60;
    if (durationMinutes < 15) {
      return res.status(400).json({
        success: false,
        error: { code: 'DURATION_TOO_SHORT', message: 'Booking must be at least 15 minutes.' },
      });
    }

    // Max 8 hours (SHARED_ENUMS.md: BOOKING_MAX_DURATION_HOURS = 8)
    if (durationMinutes > 8 * 60) {
      return res.status(400).json({
        success: false,
        error: { code: 'DURATION_TOO_LONG', message: 'Booking cannot exceed 8 hours.' },
      });
    }

    // ── 2. Verify asset exists and is bookable ────────────────────────────────
    const asset = await prisma.asset.findUnique({ where: { id: assetId } });

    if (!asset) {
      return res.status(404).json({
        success: false,
        error: { code: 'ASSET_NOT_FOUND', message: 'Asset not found.' },
      });
    }

    if (!asset.isBookable) {
      return res.status(400).json({
        success: false,
        error: {
          code:    'ASSET_NOT_BOOKABLE',
          message: `Asset "${asset.name}" (${asset.assetTag}) is not available for booking.`,
        },
      });
    }

    // ── 3. Overlap validation ─────────────────────────────────────────────────
    // SQL equivalent from WORKFLOW.md Section 6:
    //   SELECT * FROM bookings
    //   WHERE asset_id = :assetId
    //     AND status != 'CANCELLED'
    //     AND start_time < :endTime
    //     AND end_time > :startTime
    const conflict = await prisma.booking.findFirst({
      where: {
        assetId,
        status:    { not: 'CANCELLED' },
        startTime: { lt: end   },   // existing starts before new ends
        endTime:   { gt: start },   // existing ends after new starts
      },
      include: {
        user: { select: { name: true } },
      },
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        error: {
          code:    'BOOKING_OVERLAP',
          message: 'The requested time slot overlaps with an existing booking.',
          details: {
            conflictingBooking: {
              startTime: conflict.startTime,
              endTime:   conflict.endTime,
              bookedBy:  conflict.user.name,
            },
          },
        },
      });
    }

    // ── 4. Create booking ─────────────────────────────────────────────────────
    // req.user.id is now live — set by authenticate middleware
    const userId = req.user.id;

    const booking = await prisma.booking.create({
      data: {
        assetId,
        userId,
        startTime: start,
        endTime:   end,
        purpose:   purpose ?? null,
        status:    'UPCOMING',
      },
      include: {
        asset: { select: { id: true, assetTag: true, name: true } },
        user:  { select: { id: true, name: true } },
      },
    });

    // ── 5. Side effects ───────────────────────────────────────────────────────
    await createNotification({
      prisma,
      userId,
      title: 'Booking Confirmed',
      message: `Your booking for ${asset.name} from ${start.toISOString()} to ${end.toISOString()} is confirmed.`,
      type: 'BOOKING_CONFIRMED',
      category: 'BOOKINGS',
    });

    await createLog({
      prisma,
      userId,
      action: 'BOOKING_CREATED',
      entityType: 'Booking',
      entityId: booking.id,
      details: { assetId, startTime: start, endTime: end, purpose },
    });

    return res.status(201).json({
      success: true,
      data:    booking,
      message: 'Booking confirmed successfully.',
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/v1/bookings/:id/cancel
// Owner of booking OR Asset Manager / Admin can cancel
// ─────────────────────────────────────────────────────────────────────────────
const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    // ── 1. Find booking ───────────────────────────────────────────────────────
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        asset: { select: { id: true, name: true, assetTag: true } },
        user:  { select: { id: true, name: true } },
      },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: { code: 'BOOKING_NOT_FOUND', message: 'Booking not found.' },
      });
    }

    // ── 2. Permission check — owner OR asset manager / admin ─────────────────
    const isOwner   = booking.userId === req.user.id;
    const isManager = ['ASSET_MANAGER', 'ADMIN'].includes(req.user.role);

    if (!isOwner && !isManager) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You can only cancel your own bookings.' },
      });
    }

    // ── 3. State guard ────────────────────────────────────────────────────────
    if (booking.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        error: { code: 'ALREADY_CANCELLED', message: 'This booking is already cancelled.' },
      });
    }

    if (booking.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        error: { code: 'BOOKING_COMPLETED', message: 'A completed booking cannot be cancelled.' },
      });
    }

    // ── 4. Cancel booking ─────────────────────────────────────────────────────
    const updated = await prisma.booking.update({
      where: { id },
      data:  { status: 'CANCELLED' },
      include: {
        asset: { select: { id: true, assetTag: true, name: true } },
        user:  { select: { id: true, name: true } },
      },
    });

    // ── 5. Side effects ───────────────────────────────────────────────────────
    await createNotification({
      prisma,
      userId: booking.userId,
      title: 'Booking Cancelled',
      message: `Your booking for ${booking.asset.name} has been cancelled.`,
      type: 'BOOKING_CANCELLED',
      category: 'BOOKINGS',
    });

    await createLog({
      prisma,
      userId: req.user.id,
      action: 'BOOKING_CANCELLED',
      entityType: 'Booking',
      entityId: id,
      details: { assetId: booking.assetId, startTime: booking.startTime, endTime: booking.endTime },
    });

    return res.status(200).json({
      success: true,
      data:    updated,
      message: 'Booking cancelled successfully.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getBookings, createBooking, cancelBooking };
