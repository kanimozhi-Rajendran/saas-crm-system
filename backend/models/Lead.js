// ─────────────────────────────────────────────────────────────
//  Lead Model — includes AI lead score fields
// ─────────────────────────────────────────────────────────────
const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String },
    company: { type: String, trim: true },

    // ── AI Scoring Inputs ──────────────────────────────────────
    budget: {
      type: Number,
      required: true,
      min: 0,
      comment: "Estimated budget in USD",
    },
    companySize: {
      type: String,
      enum: ["1-10", "11-50", "51-200", "201-500", "500+"],
      required: true,
    },
    interactionCount: {
      type: Number,
      default: 0,
      comment: "Number of touchpoints: emails, calls, meetings",
    },
    emailResponseRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
      comment: "Percentage of emails responded to (0-100)",
    },
    previousConversion: {
      type: Boolean,
      default: false,
      comment: "Has this lead or related contact converted before?",
    },

    // ── AI Output ──────────────────────────────────────────────
    leadScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
      comment: "AI-calculated score 0-100",
    },
    leadCategory: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Low",
      comment: "Derived from leadScore: Low(0-40), Medium(41-70), High(71-100)",
    },

    // ── CRM Fields ─────────────────────────────────────────────
    source: {
      type: String,
      enum: ["Website", "Referral", "Cold Call", "Social Media", "Event", "Other"],
      default: "Other",
    },
    status: {
      type: String,
      enum: ["New", "Contacted", "Qualified", "Proposal", "Converted", "Lost"],
      default: "New",
    },
    notes: { type: String },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lead", leadSchema);
