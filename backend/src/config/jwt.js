// ============================================================================
// config/jwt.js — JWT Helpers
// Centralizes token signing and verification logic.
// ============================================================================

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const jwt = require('jsonwebtoken');

const JWT_SECRET  = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '7d'; // default 7 days

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be defined in environment variables.');
}

/**
 * signToken(payload)
 * Creates a signed JWT containing the user's id and role.
 *
 * @param  {{ userId: string, role: string }} payload
 * @returns {string} signed JWT
 */
const signToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
};

/**
 * verifyToken(token)
 * Verifies and decodes a JWT.
 *
 * @param  {string} token
 * @returns {object} decoded payload
 * @throws {JsonWebTokenError | TokenExpiredError}
 */
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = { signToken, verifyToken, JWT_EXPIRES };
