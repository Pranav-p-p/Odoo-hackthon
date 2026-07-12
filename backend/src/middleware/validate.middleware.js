// ============================================================================
// validate.middleware.js — Request Body Validation
// Provides a reusable validate() factory using plain JS validation rules.
// No external validation library required — keeps bundle lean for hackathon.
// ============================================================================

/**
 * validate(schema)
 * Returns a middleware that validates req.body against the provided schema.
 *
 * Schema format:
 * {
 *   fieldName: {
 *     required: true,                     // field must be present + non-empty
 *     type: 'string' | 'number' | 'boolean' | 'uuid' | 'email' | 'iso8601',
 *     minLength: 8,
 *     maxLength: 255,
 *     enum: ['ACTIVE', 'INACTIVE'],       // allowed values
 *     custom: (value, body) => 'error message or null',
 *   }
 * }
 *
 * Usage:
 *   router.post('/auth/signup', validate(signupSchema), signupController);
 */

// UUID v4 regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
// Basic email regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// ISO8601 datetime
const ISO8601_REGEX = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/;

const validate = (schema) => {
  return (req, res, next) => {
    const errors = {};
    const body = req.body || {};

    for (const [field, rules] of Object.entries(schema)) {
      const value = body[field];
      const isEmpty = value === undefined || value === null || value === '';

      // Required check
      if (rules.required && isEmpty) {
        errors[field] = `${field} is required.`;
        continue;
      }

      // Skip optional missing fields
      if (isEmpty) continue;

      // Type checks
      if (rules.type) {
        switch (rules.type) {
          case 'string':
            if (typeof value !== 'string') {
              errors[field] = `${field} must be a string.`;
              continue;
            }
            break;

          case 'number':
            if (typeof value !== 'number' || isNaN(value)) {
              errors[field] = `${field} must be a number.`;
              continue;
            }
            break;

          case 'boolean':
            if (typeof value !== 'boolean') {
              errors[field] = `${field} must be a boolean.`;
              continue;
            }
            break;

          case 'email':
            if (!EMAIL_REGEX.test(value)) {
              errors[field] = `${field} must be a valid email address.`;
              continue;
            }
            break;

          case 'uuid':
            if (!UUID_REGEX.test(value)) {
              errors[field] = `${field} must be a valid UUID.`;
              continue;
            }
            break;

          case 'iso8601':
            if (!ISO8601_REGEX.test(value)) {
              errors[field] = `${field} must be a valid ISO 8601 date/time string.`;
              continue;
            }
            break;
        }
      }

      // minLength
      if (rules.minLength !== undefined && typeof value === 'string' && value.length < rules.minLength) {
        errors[field] = `${field} must be at least ${rules.minLength} characters.`;
        continue;
      }

      // maxLength
      if (rules.maxLength !== undefined && typeof value === 'string' && value.length > rules.maxLength) {
        errors[field] = `${field} must be no more than ${rules.maxLength} characters.`;
        continue;
      }

      // Enum
      if (rules.enum && !rules.enum.includes(value)) {
        errors[field] = `${field} must be one of: ${rules.enum.join(', ')}.`;
        continue;
      }

      // Custom validator
      if (rules.custom) {
        const customError = rules.custom(value, body);
        if (customError) {
          errors[field] = customError;
          continue;
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed.',
          details: errors,
        },
      });
    }

    next();
  };
};

// ── Pre-built schemas (from API_CONTRACT.md) ─────────────────────────────────

const schemas = {
  // POST /auth/signup
  signup: {
    name:         { required: true,  type: 'string', minLength: 2,  maxLength: 255 },
    email:        { required: true,  type: 'email' },
    password:     { required: true,  type: 'string', minLength: 8,  maxLength: 128 },
    departmentId: { required: false, type: 'uuid' },
  },

  // POST /auth/login
  login: {
    email:    { required: true, type: 'email' },
    password: { required: true, type: 'string', minLength: 1 },
  },

  // POST /auth/forgot-password
  forgotPassword: {
    email: { required: true, type: 'email' },
  },

  // POST /departments
  createDepartment: {
    name:              { required: true,  type: 'string', minLength: 2, maxLength: 255 },
    headId:            { required: false, type: 'uuid' },
    parentDepartmentId:{ required: false, type: 'uuid' },
    status:            { required: false, enum: ['ACTIVE', 'INACTIVE'] },
  },

  // PATCH /departments/:id
  updateDepartment: {
    name:              { required: false, type: 'string', minLength: 2, maxLength: 255 },
    headId:            { required: false, type: 'uuid' },
    parentDepartmentId:{ required: false, type: 'uuid' },
    status:            { required: false, enum: ['ACTIVE', 'INACTIVE'] },
  },

  // POST /categories
  createCategory: {
    name:        { required: true,  type: 'string', minLength: 2, maxLength: 255 },
    description: { required: false, type: 'string', maxLength: 500 },
  },

  // PATCH /users/:id/role
  updateRole: {
    role: {
      required: true,
      enum: ['ASSET_MANAGER', 'DEPARTMENT_HEAD', 'EMPLOYEE'],
      custom: (val) =>
        val === 'ADMIN' ? 'Cannot assign ADMIN role via this endpoint.' : null,
    },
  },

  // PATCH /users/:id/status
  updateStatus: {
    status: { required: true, enum: ['ACTIVE', 'INACTIVE'] },
  },

  // POST /assets
  createAsset: {
    assetTag:        { required: true,  type: 'string', minLength: 1, maxLength: 100 },
    name:            { required: true,  type: 'string', minLength: 2, maxLength: 255 },
    categoryId:      { required: true,  type: 'uuid' },
    serialNumber:    { required: false, type: 'string', maxLength: 255 },
    departmentId:    { required: false, type: 'uuid' },
    isBookable:      { required: false, type: 'boolean' },
    acquisitionDate: { required: false, type: 'iso8601' },
    acquisitionCost: { required: false, type: 'number' },
    condition:       { required: false, enum: ['Excellent', 'Good', 'Fair', 'Poor'] },
    location:        { required: false, type: 'string', maxLength: 255 },
    photoUrl:        { required: false, type: 'string', maxLength: 2048 },
  },

  // POST /allocations
  createAllocation: {
    assetId:        { required: true,  type: 'uuid' },
    userId:         { required: true,  type: 'uuid' },
    expectedReturn: { required: false, type: 'iso8601' },
  },

  // PATCH /allocations/:id/return
  returnAllocation: {
    returnCondition: { required: false, enum: ['Good', 'Fair', 'Damaged'] },
    returnNotes:     { required: false, type: 'string', maxLength: 1000 },
  },

  // POST /transfers
  createTransfer: {
    assetId:  { required: true,  type: 'uuid' },
    toDeptId: { required: true,  type: 'uuid' },
    toUserId: { required: false, type: 'uuid' },
    reason:   { required: false, type: 'string', maxLength: 500 },
  },

  // POST /bookings
  createBooking: {
    assetId:   { required: true,  type: 'uuid' },
    startTime: { required: true,  type: 'iso8601' },
    endTime:   { required: true,  type: 'iso8601' },
    purpose:   { required: false, type: 'string', maxLength: 255 },
    custom: (val, body) => {
      if (body.startTime && body.endTime && new Date(body.startTime) >= new Date(body.endTime)) {
        return 'startTime must be before endTime.';
      }
      return null;
    },
  },

  // POST /maintenance-requests
  createMaintenance: {
    assetId:          { required: true,  type: 'uuid' },
    issueDescription: { required: true,  type: 'string', minLength: 10, maxLength: 2000 },
    priority:         { required: false, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
    photoUrl:         { required: false, type: 'string', maxLength: 2048 },
  },

  // POST /audits
  createAudit: {
    name:          { required: true,  type: 'string', minLength: 2, maxLength: 255 },
    auditorId:     { required: true,  type: 'uuid' },
    startDate:     { required: true,  type: 'iso8601' },
    endDate:       { required: true,  type: 'iso8601' },
    departmentId:  { required: false, type: 'uuid' },
    locationScope: { required: false, type: 'string', maxLength: 255 },
  },

  // PATCH /audits/:id/items/:itemId
  updateAuditItem: {
    actualStatus: { required: true,  enum: ['VERIFIED', 'MISSING', 'DAMAGED'] },
    notes:        { required: false, type: 'string', maxLength: 1000 },
  },
};

module.exports = { validate, schemas };
