// ============================================================================
// routes/user.routes.js — User & Employee Management Endpoints
// ============================================================================

const express = require('express');
const prisma = require('../config/prisma');
const { authenticate } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/role.middleware');
const { validate, schemas } = require('../middleware/validate.middleware');
const { createError } = require('../middleware/error.middleware');

const router = express.Router();

// GET /users — Retrieve all users (Admin only) with role, status, and department filters
router.get('/', authenticate, adminOnly, async (req, res, next) => {
  try {
    const { role, status, departmentId } = req.query;

    const where = {};
    if (role) where.role = role;
    if (status) where.status = status;
    if (departmentId) where.departmentId = departmentId;

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        departmentId: true,
        department: {
          select: {
            name: true,
          },
        },
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    });

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /users/:id/role — Promote Employee to Dept Head or Asset Manager (Admin only)
router.patch('/:id/role', authenticate, adminOnly, validate(schemas.updateRole), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      throw createError(404, 'NOT_FOUND', 'User not found.');
    }

    if (targetUser.status !== 'ACTIVE') {
      throw createError(400, 'USER_INACTIVE', 'Cannot update roles for an INACTIVE user.');
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });

    res.status(200).json({
      success: true,
      data: updatedUser,
      message: `User role successfully updated to ${role}.`,
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /users/:id/status — Activate or deactivate user account (Admin only)
router.patch('/:id/status', authenticate, adminOnly, validate(schemas.updateStatus), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      throw createError(404, 'NOT_FOUND', 'User not found.');
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });

    res.status(200).json({
      success: true,
      data: updatedUser,
      message: `User status successfully updated to ${status}.`,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
