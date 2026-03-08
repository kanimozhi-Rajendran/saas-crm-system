// ─────────────────────────────────────────────────────────────
//  Activity Logger — Centralized audit trail logging
// ─────────────────────────────────────────────────────────────
const Activity = require("../models/Activity");

/**
 * Log an activity to the audit trail
 * @param {String} entityType - Lead, Deal, Customer, Ticket, User
 * @param {ObjectId} entityId - ID of the entity
 * @param {String} action - created, updated, deleted, status_changed, assigned, converted
 * @param {String} description - Human readable description
 * @param {ObjectId} userId - User who performed the action
 * @param {Object} metadata - Additional context data
 */
const logActivity = async (entityType, entityId, action, description, userId, metadata = {}) => {
  try {
    await Activity.create({
      entityType,
      entityId,
      action,
      description,
      performedBy: userId,
      metadata,
    });
  } catch (error) {
    console.error("Activity logging failed:", error.message);
    // Don't throw - logging failure shouldn't break main operation
  }
};

module.exports = { logActivity };
