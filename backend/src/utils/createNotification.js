/**
 * createNotification.js (formerly notificationService.js)
 * Creates a notification for a user.
 * 
 * @param {Object} params
 * @param {Object} params.prisma - Prisma client instance
 * @param {string} params.userId - ID of the target user
 * @param {string} params.title - Notification title
 * @param {string} params.message - Notification message
 * @param {string} params.type - Notification type (from NotificationType in SHARED_ENUMS.md)
 * @param {string} params.category - Category (ALERTS, APPROVALS, BOOKINGS)
 * @returns {Promise<Object>} Created Notification record
 */
const createNotification = async ({
  prisma,
  userId,
  title,
  message,
  type,
  category
}) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        category,
        isRead: false
      }
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw new Error('Failed to create notification');
  }
};

module.exports = {
  createNotification
};
