// ============================================================================
// routes/auth.routes.js — Authentication Endpoints
// ============================================================================

const express = require('express');
const bcrypt = require('bcrypt');
const prisma = require('../config/prisma');
const { signToken } = require('../config/jwt');
const { authenticate } = require('../middleware/auth.middleware');
const { validate, schemas } = require('../middleware/validate.middleware');
const { createError } = require('../middleware/error.middleware');

const router = express.Router();

// POST /auth/signup — Create EMPLOYEE with bcrypt + JWT
router.post('/signup', validate(schemas.signup), async (req, res, next) => {
  try {
    const { name, email, password, departmentId } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw createError(409, 'DUPLICATE_ENTRY', 'Email address is already registered.');
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user with default EMPLOYEE role and ACTIVE status
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: 'EMPLOYEE',
        status: 'ACTIVE',
        departmentId: departmentId || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });

    // Generate JWT token
    const token = signToken({ userId: user.id, role: user.role });

    res.status(201).json({
      success: true,
      data: { token, user },
      message: 'Signup successful.',
    });
  } catch (err) {
    next(err);
  }
});

// POST /auth/login — Authenticate & return JWT. Reject INACTIVE users.
router.post('/login', validate(schemas.login), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Fetch user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw createError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
    }

    // Check status
    if (user.status === 'INACTIVE') {
      throw createError(403, 'USER_INACTIVE', 'Your account has been deactivated.');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw createError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
    }

    // Generate token
    const token = signToken({ userId: user.id, role: user.role });

    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          departmentId: user.departmentId,
        },
      },
      message: 'Login successful.',
    });
  } catch (err) {
    next(err);
  }
});

// POST /auth/forgot-password — Initiate password reset (demo mode)
router.post('/forgot-password', validate(schemas.forgotPassword), async (req, res, next) => {
  try {
    const { email } = req.body;

    // For demo purposes, we just log to console and return success
    console.log(`[DEMO] Password reset requested for: ${email}`);

    res.status(200).json({
      success: true,
      message: 'Reset link sent if email exists',
    });
  } catch (err) {
    next(err);
  }
});

// GET /auth/me — Return current user from JWT
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        departmentId: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
