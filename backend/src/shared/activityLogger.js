/**
 * Creates an activity log entry.
 * 
 * @param {Object} params
 * @param {Object} params.prisma - Prisma client instance
 * @param {string} [params.userId] - ID of the user performing the action (optional)
 * @param {string} params.action - Action performed (e.g., "ASSET_REGISTERED")
 * @param {string} params.entityType - Type of entity (e.g., "Asset")
 * @param {string} params.entityId - ID of the entity
 * @param {Object} [params.details] - Additional JSON details
 * @returns {Promise<Object>} Created ActivityLog record
 */
const createLog = async ({
  prisma,
  userId,
  action,
  entityType,
  entityId,
  details
}) => {
  try {
    const data = {
      action,
      entityType,
      entityId,
    };

    if (userId) {
      data.userId = userId;
    }

    if (details) {
      data.details = details;
    }

    const log = await prisma.activityLog.create({
      data
    });
    return log;
  } catch (error) {
    console.error('Error creating activity log:', error);
    throw new Error('Failed to create activity log');
  }
};

module.exports = {
  createLog
};
