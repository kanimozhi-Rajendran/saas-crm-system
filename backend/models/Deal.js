// ─────────────────────────────────────────────────────────────
//  Deal Model — includes AI deal probability
// ─────────────────────────────────────────────────────────────
const mongoose = require("mongoose");

const dealSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    value: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "USD" },

    // ── AI Prediction Inputs ───────────────────────────────────
    stage: {
      type: String,
      enum: ["Prospecting", "Qualification", "Proposal", "Negotiation", "Closed Won", "Closed Lost"],
      default: "Prospecting",
    },
    leadScore: { type: Number, min: 0, max: 100, default: 0 },
    daysInPipeline: { type: Number, default: 0 },
    competitorCount: { type: Number, default: 0, comment: "Number of competing vendors" },
    stakeholderCount: { type: Number, default: 1, comment: "Decision makers involved" },
    hasBudgetConfirmed: { type: Boolean, default: false },
    hasChampion: { type: Boolean, default: false, comment: "Internal advocate at client" },

    // ── AI Output ──────────────────────────────────────────────
    dealProbability: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
      comment: "AI-predicted probability of closing (0-100)",
    },
    dealPredictionStatus: {
      type: String,
      default: "Unknown",
      comment: "e.g. High chance of closing, Deal at risk",
    },

    // ── CRM Fields ─────────────────────────────────────────────
    closeDate: { type: Date },
    actualCloseDate: { type: Date },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    lead: { type: mongoose.Schema.Types.ObjectId, ref: "Lead" },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    notes: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Deal", dealSchema);