// ─────────────────────────────────────────────────────────────
//  Customer Model
// ─────────────────────────────────────────────────────────────
const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, trim: true },
    company: { type: String, trim: true },
    companySize: {
      type: String,
      enum: ["1-10", "11-50", "51-200", "201-500", "500+"],
      default: "1-10",
    },
    industry: { type: String, trim: true },
    address: { type: String },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Prospect"],
      default: "Prospect",
    },
    // Total revenue generated from this customer
    totalRevenue: { type: Number, default: 0 },
    // Number of interactions (calls, emails, meetings)
    interactionCount: { type: Number, default: 0 },
    // Whether this customer has converted before (used in AI scoring)
    previousConversion: { type: Boolean, default: false },
    notes: { type: String },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

// Index for search performance
customerSchema.index({ name: "text", email: "text", company: "text" });

module.exports = mongoose.model("Customer", customerSchema);