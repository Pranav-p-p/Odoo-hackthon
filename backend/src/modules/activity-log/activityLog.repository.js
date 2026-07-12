/**
 * activityLog.repository.js
 * Raw Prisma queries only — no business logic.
 * Uses the shared Prisma singleton from config/prisma.js.
 */

const prisma = require('../../config/prisma');

/**
 * Fetches a paginated, filtered list of activity logs.
 *
 * @param {Object} filters
 * @param {string} [filters.entityType]
 * @param {string} [filters.entityId]
 * @param {string} [filters.userId]
 * @param {number} filters.page
 * @param {number} filters.limit
 * @returns {Promise<{ logs: Array, total: number }>}
 */
const findLogs = async ({ entityType, entityId, userId, page, limit }) => {
  const where = {};

  if (entityType) {
    where.entityType = entityType;
  }
  if (entityId) {
    where.entityId = entityId;
  }
  if (userId) {
    where.userId = userId;
  }

  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.activityLog.count({ where }),
  ]);

  return { logs, total };
};

module.exports = {
  findLogs,
};
