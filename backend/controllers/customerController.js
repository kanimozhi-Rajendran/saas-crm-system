// ─────────────────────────────────────────────────────────────
//  Customer Controller — Full CRUD
// ─────────────────────────────────────────────────────────────
const Customer = require("../models/Customer");

const createCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: customer });
  } catch (error) { next(error); }
};

const getCustomers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) filter.$text = { $search: search };

    const customers = await Customer.find(filter)
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Customer.countDocuments(filter);
    res.json({ success: true, data: customers, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
};

const getCustomerById = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id).populate("assignedTo", "name email role");
    if (!customer) return res.status(404).json({ success: false, message: "Customer not found" });
    res.json({ success: true, data: customer });
  } catch (error) { next(error); }
};

const updateCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!customer) return res.status(404).json({ success: false, message: "Customer not found" });
    res.json({ success: true, data: customer });
  } catch (error) { next(error); }
};

const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: "Customer not found" });
    res.json({ success: true, message: "Customer deleted" });
  } catch (error) { next(error); }
};

module.exports = { createCustomer, getCustomers, getCustomerById, updateCustomer, deleteCustomer };


// ── @route  GET /api/customers/:id/churn-prediction ───────────
const getChurnPrediction = async (req, res, next) => {
  try {
    const { predictCustomerChurn } = require("../utils/aiEngine");
    const Ticket = require("../models/Ticket");
    const Deal = require("../models/Deal");

    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    // Calculate days since last interaction
    const daysSinceLastInteraction = customer.updatedAt
      ? Math.floor((Date.now() - new Date(customer.updatedAt)) / (1000 * 60 * 60 * 24))
      : 365;

    // Get ticket counts
    const [openTicketsCount, resolvedTicketsCount, dealCount] = await Promise.all([
      Ticket.countDocuments({ customer: customer._id, status: { $in: ["Open", "In Progress"] } }),
      Ticket.countDocuments({ customer: customer._id, status: "Resolved" }),
      Deal.countDocuments({ customer: customer._id }),
    ]);

    const churnData = {
      daysSinceLastInteraction,
      totalRevenue: customer.totalRevenue || 0,
      openTicketsCount,
      resolvedTicketsCount,
      dealCount,
      interactionCount: customer.interactionCount || 0,
      previousConversion: customer.previousConversion || false,
    };

    const prediction = predictCustomerChurn(churnData);

    res.json({
      success: true,
      customer: {
        _id: customer._id,
        name: customer.name,
        company: customer.company,
      },
      churnPrediction: prediction,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createCustomer, getCustomers, getCustomerById, updateCustomer, deleteCustomer, getChurnPrediction };
