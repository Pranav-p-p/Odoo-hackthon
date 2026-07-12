// ============================================================================
// role.middleware.js — Role Based Access Control (RBAC)
// Use after authenticate middleware.
// ============================================================================

/**
 * Role hierarchy (highest → lowest)
 * ADMIN > ASSET_MANAGER > DEPARTMENT_HEAD > EMPLOYEE
 */
const ROLES = {
  ADMIN: 4,
  ASSET_MANAGER: 3,
  DEPARTMENT_HEAD: 2,
  EMPLOYEE: 1,
};

/**
 * allowRoles(...roles)
 * Factory function — returns middleware that only allows specified roles.
 *
 * Usage:
 *   router.post('/assets', authenticate, allowRoles('ASSET_MANAGER', 'ADMIN'), createAsset);
 *
 * @param  {...string} roles - One or more allowed role strings
 */
const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NOT_AUTHENTICATED',
          message: 'You must be logged in to access this resource.',
        },
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}.`,
        },
      });
    }

    next();
  };
};

/**
 * requireMinRole(role)
 * Allows the specified role AND all roles above it in the hierarchy.
 *
 * Usage:
 *   router.get('/users', authenticate, requireMinRole('ASSET_MANAGER'), listUsers);
 *   → allows ASSET_MANAGER and ADMIN
 *
 * @param {string} minRole - Minimum required role
 */
const requireMinRole = (minRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NOT_AUTHENTICATED',
          message: 'You must be logged in to access this resource.',
        },
      });
    }

    const userLevel = ROLES[req.user.role] ?? 0;
    const requiredLevel = ROLES[minRole] ?? 0;

    if (userLevel < requiredLevel) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Minimum required role: ${minRole}. Your role: ${req.user.role}.`,
        },
      });
    }

    next();
  };
};

/**
 * Pre-built role guards for convenience
 */
const adminOnly          = allowRoles('ADMIN');
const assetManagerOrAbove = requireMinRole('ASSET_MANAGER');  // ASSET_MANAGER + ADMIN
const deptHeadOrAbove    = requireMinRole('DEPARTMENT_HEAD'); // DEPT_HEAD + ASSET_MANAGER + ADMIN
const anyAuthenticatedUser = requireMinRole('EMPLOYEE');      // all roles

module.exports = {
  allowRoles,
  requireMinRole,
  adminOnly,
  assetManagerOrAbove,
  deptHeadOrAbove,
  anyAuthenticatedUser,
};
