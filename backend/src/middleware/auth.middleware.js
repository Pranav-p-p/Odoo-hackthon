// ============================================================================
// auth.middleware.js — JWT Verification → req.user
// Verifies the Bearer token and attaches the decoded user to req.user.
// ============================================================================

const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

/**
 * authenticate
 * Validates the JWT from the Authorization header.
 * On success, attaches full user record to req.user.
 * On failure, returns 401 Unauthorized.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: 'Authorization token is required.',
        },
      });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error('JWT_SECRET is not configured in environment variables.');
    }

    // Verify and decode the token
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      const isExpired = err.name === 'TokenExpiredError';
      return res.status(401).json({
        success: false,
        error: {
          code: isExpired ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN',
          message: isExpired
            ? 'Your session has expired. Please log in again.'
            : 'Invalid token. Please log in again.',
        },
      });
    }

    // Fetch current user from DB to get up-to-date role + status
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        departmentId: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'The user associated with this token no longer exists.',
        },
      });
    }

    if (user.status === 'INACTIVE') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'USER_INACTIVE',
          message: 'Your account has been deactivated. Please contact an administrator.',
        },
      });
    }

    // Attach user to request for downstream middleware + controllers
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { authenticate };
