// ─────────────────────────────────────────────────────────────
//  Activity Model — Audit Trail for all CRM actions
// ─────────────────────────────────────────────────────────────
const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    entityType: {
      type: String,
      enum: ["Lead", "Deal", "Customer", "Ticket", "User"],
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: ["created", "updated", "deleted", "status_changed", "assigned", "converted"],
    },
    description: {
      type: String,
      required: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// Index for fast queries
activitySchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
activitySchema.index({ performedBy: 1, createdAt: -1 });

module.exports = mongoose.model("Activity", activitySchema);
