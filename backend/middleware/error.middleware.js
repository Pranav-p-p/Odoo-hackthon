// ============================================================================
// error.middleware.js — Global Error Handler
// Must be registered LAST in server.js: app.use(errorHandler)
// ============================================================================

/**
 * errorHandler
 * Catches all errors passed via next(err) and returns a consistent
 * JSON response matching the API_CONTRACT.md error format.
 */
const errorHandler = (err, req, res, next) => {
    // Avoid sending response if already started
    if (res.headersSent) {
        return next(err);
    }

    // ── Prisma Known Errors ────────────────────────────────────────────────────
    if (err.code) {
        switch (err.code) {
            // Unique constraint violation (e.g. duplicate email, duplicate assetTag)
            case 'P2002': {
                const field = err.meta?.target?.join(', ') || 'field';
                return res.status(409).json({
                    success: false,
                    error: {
                        code: 'DUPLICATE_ENTRY',
                        message: `A record with this ${field} already exists.`,
                        details: { field },
                    },
                });
            }

            // Record not found (e.g. findUniqueOrThrow)
            case 'P2025':
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: err.meta?.cause || 'The requested resource was not found.',
                    },
                });

            // Foreign key constraint failed (e.g. invalid categoryId)
            case 'P2003': {
                const field = err.meta?.field_name || 'related record';
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_REFERENCE',
                        message: `The referenced ${field} does not exist.`,
                        details: { field },
                    },
                });
            }

            // Record required but not found
            case 'P2001':
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'The requested record does not exist.',
                    },
                });
        }
    }

    // ── JWT Errors (should be caught by auth middleware, but just in case) ─────
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            error: { code: 'INVALID_TOKEN', message: 'Invalid authentication token.' },
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            error: { code: 'TOKEN_EXPIRED', message: 'Authentication token has expired.' },
        });
    }

    // ── Business Logic Errors (thrown manually in controllers) ────────────────
    // Usage: const err = new Error('Asset is already allocated.'); err.status = 409; err.code = 'ALREADY_ALLOCATED'; throw err;
    if (err.status && err.status < 500) {
        return res.status(err.status).json({
            success: false,
            error: {
                code: err.errorCode || 'REQUEST_ERROR',
                message: err.message || 'An error occurred.',
                details: err.details || undefined,
            },
        });
    }

    // ── Syntax Error (malformed JSON body) ─────────────────────────────────────
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({
            success: false,
            error: {
                code: 'INVALID_JSON',
                message: 'Request body contains malformed JSON.',
            },
        });
    }

    // ── Unhandled / Unknown Errors (500) ──────────────────────────────────────
    const isDev = process.env.NODE_ENV === 'development';

    console.error('[ERROR]', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        body: req.body,
    });

    return res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred. Please try again later.',
            // Only expose stack trace in development
            ...(isDev && { stack: err.stack }),
        },
    });
};

/**
 * notFoundHandler
 * Catches requests to undefined routes.
 * Register BEFORE errorHandler in server.js.
 */
const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        error: {
            code: 'ROUTE_NOT_FOUND',
            message: `Cannot ${req.method} ${req.originalUrl}`,
        },
    });
};

/**
 * createError(status, code, message, details)
 * Helper to create structured errors from controllers.
 *
 * Usage:
 *   throw createError(409, 'ALREADY_ALLOCATED', 'Asset is already allocated.', { currentHolder });
 */
const createError = (status, errorCode, message, details = undefined) => {
    const err = new Error(message);
    err.status = status;
    err.errorCode = errorCode;
    err.details = details;
    return err;
};

module.exports = { errorHandler, notFoundHandler, createError };
