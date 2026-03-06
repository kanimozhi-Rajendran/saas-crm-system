// ─────────────────────────────────────────────────────────────
//  Deal Controller — with AI probability prediction
// ─────────────────────────────────────────────────────────────
const Deal = require("../models/Deal");
const { predictDealSuccess } = require("../utils/aiEngine");

// ── @route  POST /api/deals ───────────────────────────────────
const createDeal = async (req, res, next) => {
  try {
    const {
      title, value, currency, stage, leadScore, daysInPipeline,
      competitorCount, stakeholderCount, hasBudgetConfirmed, hasChampion,
      closeDate, customer, lead, assignedTo, notes,
    } = req.body;

    // ── AI Deal Prediction ───────────────────────────────────
    const { probability, status: predStatus, insights } = predictDealSuccess({
      stage, leadScore, daysInPipeline, competitorCount,
      stakeholderCount, hasBudgetConfirmed, hasChampion, value,
    });

    const deal = await Deal.create({
      title, value, currency, stage, leadScore, daysInPipeline,
      competitorCount, stakeholderCount, hasBudgetConfirmed, hasChampion,
      dealProbability: probability,
      dealPredictionStatus: predStatus,
      closeDate, customer, lead, assignedTo, notes,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: deal,
      ai: { probability, status: predStatus, insights },
    });
  } catch (error) {
    next(error);
  }
};

// ── @route  GET /api/deals ────────────────────────────────────
const getDeals = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, stage, search } = req.query;
    const filter = {};
    if (stage) filter.stage = stage;
    if (search) filter.title = { $regex: search, $options: "i" };

    const deals = await Deal.find(filter)
      .populate("assignedTo", "name email")
      .populate("customer", "name company")
      .sort({ dealProbability: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Deal.countDocuments(filter);

    res.json({
      success: true,
      data: deals,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// ── @route  GET /api/deals/:id ────────────────────────────────
const getDealById = async (req, res, next) => {
  try {
    const deal = await Deal.findById(req.params.id)
      .populate("assignedTo", "name email role")
      .populate("customer")
      .populate("lead");

    if (!deal) return res.status(404).json({ success: false, message: "Deal not found" });

    const { probability, status: predStatus, insights } = predictDealSuccess(deal);
    res.json({ success: true, data: deal, ai: { probability, status: predStatus, insights } });
  } catch (error) {
    next(error);
  }
};

// ── @route  PUT /api/deals/:id ────────────────────────────────
const updateDeal = async (req, res, next) => {
  try {
    const existing = await Deal.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: "Deal not found" });

    const merged = { ...existing.toObject(), ...req.body };
    const { probability, status: predStatus } = predictDealSuccess(merged);
    req.body.dealProbability = probability;
    req.body.dealPredictionStatus = predStatus;

    const deal = await Deal.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });

    res.json({ success: true, data: deal });
  } catch (error) {
    next(error);
  }
};

// ── @route  DELETE /api/deals/:id ─────────────────────────────
const deleteDeal = async (req, res, next) => {
  try {
    const deal = await Deal.findByIdAndDelete(req.params.id);
    if (!deal) return res.status(404).json({ success: false, message: "Deal not found" });
    res.json({ success: true, message: "Deal deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { createDeal, getDeals, getDealById, updateDeal, deleteDeal };
