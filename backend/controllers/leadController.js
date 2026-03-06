
// ─────────────────────────────────────────────────────────────
//  Lead Controller — with AI scoring
// ─────────────────────────────────────────────────────────────
const Lead = require("../models/Lead");
const { calculateLeadScore } = require("../utils/aiEngine");

// ── @route  POST /api/leads ───────────────────────────────────
const createLead = async (req, res, next) => {
  try {
    const {
      name, email, phone, company, budget, companySize,
      interactionCount, emailResponseRate, previousConversion,
      source, status, notes, assignedTo, customer,
    } = req.body;

    // ── AI Lead Scoring ──────────────────────────────────────
    const { score, category, breakdown } = calculateLeadScore({
      budget, companySize, interactionCount, emailResponseRate, previousConversion,
    });

    const lead = await Lead.create({
      name, email, phone, company, budget, companySize,
      interactionCount: interactionCount || 0,
      emailResponseRate: emailResponseRate || 0,
      previousConversion: previousConversion || false,
      leadScore: score,
      leadCategory: category,
      source, status, notes, assignedTo, customer,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: lead,
      ai: { score, category, breakdown },
      message: `Lead created with AI score: ${score} (${category})`,
    });
  } catch (error) {
    next(error);
  }
};

// ── @route  GET /api/leads ────────────────────────────────────
const getLeads = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category, status, search } = req.query;
    const filter = {};
    if (category) filter.leadCategory = category;
    if (status) filter.status = status;
    if (search) filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { company: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];

    const leads = await Lead.find(filter)
      .populate("assignedTo", "name email")
      .populate("customer", "name company")
      .sort({ leadScore: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Lead.countDocuments(filter);

    res.json({
      success: true,
      data: leads,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// ── @route  GET /api/leads/:id ────────────────────────────────
const getLeadById = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate("assignedTo", "name email role")
      .populate("customer");

    if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });

    // Recalculate AI score on fetch (latest values)
    const { score, category, breakdown } = calculateLeadScore(lead);

    res.json({ success: true, data: lead, ai: { score, category, breakdown } });
  } catch (error) {
    next(error);
  }
};

// ── @route  PUT /api/leads/:id ────────────────────────────────
const updateLead = async (req, res, next) => {
  try {
    const updates = req.body;

    // Recalculate AI score on update
    const existing = await Lead.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: "Lead not found" });

    const merged = { ...existing.toObject(), ...updates };
    const { score, category } = calculateLeadScore(merged);
    updates.leadScore = score;
    updates.leadCategory = category;

    const lead = await Lead.findByIdAndUpdate(req.params.id, updates, {
      new: true, runValidators: true,
    });

    res.json({ success: true, data: lead, message: `AI score updated to ${score} (${category})` });
  } catch (error) {
    next(error);
  }
};

// ── @route  DELETE /api/leads/:id ─────────────────────────────
const deleteLead = async (req, res, next) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });
    res.json({ success: true, message: "Lead deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { createLead, getLeads, getLeadById, updateLead, deleteLead };