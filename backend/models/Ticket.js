// ─────────────────────────────────────────────────────────────
//  Support Ticket Model
// ─────────────────────────────────────────────────────────────
const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved", "Closed"],
      default: "Open",
    },
    category: {
      type: String,
      enum: ["Technical", "Billing", "Feature Request", "General", "Bug"],
      default: "General",
    },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Resolution tracking for analytics
    resolvedAt: { type: Date },
    resolutionTimeHours: { type: Number, default: null },

    comments: [
      {
        text: { type: String, required: true },
        author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// ── Auto-calculate resolution time ────────────────────────────
ticketSchema.pre("save", function (next) {
  if (this.isModified("status") && this.status === "Resolved" && !this.resolvedAt) {
    this.resolvedAt = new Date();
    const created = new Date(this.createdAt || Date.now());
    this.resolutionTimeHours = Math.round((this.resolvedAt - created) / (1000 * 60 * 60));
  }
  next();
});

module.exports = mongoose.model("Ticket", ticketSchema);