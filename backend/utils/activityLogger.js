const logActivity = async (entityType, entityId, action, description, userId, metadata = {}) => {
  try {
    console.log(`[Activity] ${entityType} | ${action} | ${description}`);
  } catch (error) {
    console.error("Activity log error:", error.message);
  }
};

module.exports = { logActivity };