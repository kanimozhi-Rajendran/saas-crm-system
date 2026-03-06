// ─────────────────────────────────────────────────────────────
//  Analytics Controller — Dashboard Metrics + AI Recommendations
// ─────────────────────────────────────────────────────────────
const Customer = require("../models/Customer");
const Lead = require("../models/Lead");
const Deal = require("../models/Deal");
const Ticket = require("../models/Ticket");
const { generateRecommendations } = require("../utils/aiEngine");

// ── @route  GET /api/analytics/dashboard ─────────────────────
const getDashboardMetrics = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // ── Parallel DB queries for performance ───────────────────
    const [
      totalCustomers,
      newCustomersThisMonth,
      totalLeads,
      convertedLeads,
      activeDeals,
      closedWonDeals,
      closedWonValue,
      openTickets,
      resolvedTickets,
      avgResolutionTime,
      leadsByCategory,
      dealsByStage,
      monthlyRevenue,
    ] = await Promise.all([
      Customer.countDocuments(),
      Customer.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Lead.countDocuments(),
      Lead.countDocuments({ status: "Converted" }),
      Deal.countDocuments({ isActive: true, stage: { $nin: ["Closed Won", "Closed Lost"] } }),
      Deal.countDocuments({ stage: "Closed Won" }),

      // Total revenue from closed deals
      Deal.aggregate([
        { $match: { stage: "Closed Won" } },
        { $group: { _id: null, total: { $sum: "$value" } } },
      ]),

      Ticket.countDocuments({ status: "Open" }),
      Ticket.countDocuments({ status: "Resolved" }),

      // Avg resolution time
      Ticket.aggregate([
        { $match: { resolutionTimeHours: { $ne: null } } },
        { $group: { _id: null, avg: { $avg: "$resolutionTimeHours" } } },
      ]),

      // Lead distribution by AI category
      Lead.aggregate([
        { $group: { _id: "$leadCategory", count: { $sum: 1 } } },
      ]),

      // Deals grouped by stage
      Deal.aggregate([
        { $group: { _id: "$stage", count: { $sum: 1 }, totalValue: { $sum: "$value" } } },
      ]),

      // Monthly revenue for last 6 months
      Deal.aggregate([
        { $match: { stage: "Closed Won", actualCloseDate: { $exists: true } } },
        {
          $group: {
            _id: {
              year: { $year: "$actualCloseDate" },
              month: { $month: "$actualCloseDate" },
            },
            revenue: { $sum: "$value" },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        { $limit: 6 },
      ]),
    ]);

    const leadConversionRate =
      totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

    res.json({
      success: true,
      data: {
        overview: {
          totalCustomers,
          newCustomersThisMonth,
          totalLeads,
          convertedLeads,
          leadConversionRate,
          activeDeals,
          closedWonDeals,
          totalRevenue: closedWonValue[0]?.total || 0,
          openTickets,
          resolvedTickets,
          avgResolutionTimeHours: Math.round(avgResolutionTime[0]?.avg || 0),
        },
        charts: {
          leadsByCategory: leadsByCategory.reduce((acc, item) => {
            acc[item._id] = item.count; return acc;
          }, {}),
          dealsByStage: dealsByStage.map((d) => ({
            stage: d._id, count: d.count, value: d.totalValue,
          })),
          monthlyRevenue: monthlyRevenue.map((m) => ({
            month: `${m._id.year}-${String(m._id.month).padStart(2, "0")}`,
            revenue: m.revenue,
            deals: m.count,
          })),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── @route  GET /api/analytics/recommendations ────────────────
const getRecommendations = async (req, res, next) => {
  try {
    // Fetch recent data for AI analysis (limit to 50 each for performance)
    const [leads, deals, tickets, customers] = await Promise.all([
      Lead.find({ status: { $nin: ["Converted", "Lost"] } }).sort({ leadScore: -1 }).limit(50),
      Deal.find({ isActive: true }).sort({ dealProbability: -1 }).limit(50),
      Ticket.find({ status: { $nin: ["Resolved", "Closed"] } }).limit(50),
      Customer.find().sort({ totalRevenue: -1 }).limit(50),
    ]);

    const recommendations = generateRecommendations({ leads, deals, tickets, customers });

    res.json({
      success: true,
      count: recommendations.length,
      data: recommendations,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardMetrics, getRecommendations };
