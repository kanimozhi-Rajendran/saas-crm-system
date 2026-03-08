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


// ── @route  GET /api/analytics/ai-insights ────────────────────
const getAIInsights = async (req, res, next) => {
  try {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // This month vs last month comparison
    const [thisMonthRevenue, lastMonthRevenue, thisMonthLeads, lastMonthLeads, thisMonthDeals, lastMonthDeals] =
      await Promise.all([
        Deal.aggregate([
          { $match: { stage: "Closed Won", actualCloseDate: { $gte: thisMonthStart } } },
          { $group: { _id: null, total: { $sum: "$value" } } },
        ]),
        Deal.aggregate([
          {
            $match: {
              stage: "Closed Won",
              actualCloseDate: { $gte: lastMonthStart, $lte: lastMonthEnd },
            },
          },
          { $group: { _id: null, total: { $sum: "$value" } } },
        ]),
        Lead.countDocuments({ createdAt: { $gte: thisMonthStart } }),
        Lead.countDocuments({ createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } }),
        Deal.countDocuments({ createdAt: { $gte: thisMonthStart } }),
        Deal.countDocuments({ createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } }),
      ]);

    const thisRevenue = thisMonthRevenue[0]?.total || 0;
    const lastRevenue = lastMonthRevenue[0]?.total || 1;
    const revenueGrowth = Math.round(((thisRevenue - lastRevenue) / lastRevenue) * 100);

    const leadsGrowth =
      lastMonthLeads > 0 ? Math.round(((thisMonthLeads - lastMonthLeads) / lastMonthLeads) * 100) : 0;
    const dealsGrowth =
      lastMonthDeals > 0 ? Math.round(((thisMonthDeals - lastMonthDeals) / lastMonthDeals) * 100) : 0;

    // Top performing sales rep
    const topPerformer = await Deal.aggregate([
      { $match: { stage: "Closed Won" } },
      { $group: { _id: "$createdBy", deals: { $sum: 1 }, revenue: { $sum: "$value" } } },
      { $sort: { revenue: -1 } },
      { $limit: 1 },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
      { $unwind: "$user" },
    ]);

    // Industry breakdown
    const industryBreakdown = await Customer.aggregate([
      { $group: { _id: "$industry", count: { $sum: 1 }, revenue: { $sum: "$totalRevenue" } } },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]);

    // Pipeline health score calculation
    const [totalLeads, convertedLeads, avgDealValue, avgResolutionTime] = await Promise.all([
      Lead.countDocuments(),
      Lead.countDocuments({ status: "Converted" }),
      Deal.aggregate([{ $group: { _id: null, avg: { $avg: "$value" } } }]),
      Ticket.aggregate([
        { $match: { resolutionTimeHours: { $ne: null } } },
        { $group: { _id: null, avg: { $avg: "$resolutionTimeHours" } } },
      ]),
    ]);

    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
    const dealSizeScore = Math.min((avgDealValue[0]?.avg || 0) / 1000, 40); // Max 40 points
    const resolutionScore = Math.max(40 - (avgResolutionTime[0]?.avg || 0) / 2, 0); // Max 40 points
    const pipelineHealthScore = Math.round(conversionRate * 0.2 + dealSizeScore + resolutionScore);

    // Revenue forecast (simple linear trend)
    const last3Months = await Deal.aggregate([
      { $match: { stage: "Closed Won", actualCloseDate: { $exists: true } } },
      {
        $group: {
          _id: { year: { $year: "$actualCloseDate" }, month: { $month: "$actualCloseDate" } },
          revenue: { $sum: "$value" },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 3 },
    ]);

    let forecastRevenue = 0;
    if (last3Months.length >= 2) {
      const avgRevenue = last3Months.reduce((sum, m) => sum + m.revenue, 0) / last3Months.length;
      const growthRate = last3Months.length >= 2
        ? (last3Months[0].revenue - last3Months[last3Months.length - 1].revenue) /
          last3Months[last3Months.length - 1].revenue
        : 0;
      forecastRevenue = Math.round(avgRevenue * (1 + growthRate));
    }

    // High churn risk customers
    const { predictCustomerChurn } = require("../utils/aiEngine");
    const customers = await Customer.find().limit(50);
    const highRiskCustomers = [];

    for (const customer of customers) {
      const daysSince = Math.floor((Date.now() - new Date(customer.updatedAt)) / (1000 * 60 * 60 * 24));
      const prediction = predictCustomerChurn({
        daysSinceLastInteraction: daysSince,
        totalRevenue: customer.totalRevenue || 0,
        openTicketsCount: 0,
        resolvedTicketsCount: 0,
        dealCount: 0,
        interactionCount: customer.interactionCount || 0,
        previousConversion: customer.previousConversion || false,
      });

      if (prediction.churnProbability > 70) {
        highRiskCustomers.push({
          _id: customer._id,
          name: customer.name,
          company: customer.company,
          churnProbability: prediction.churnProbability,
          riskLevel: prediction.riskLevel,
        });
      }
    }

    res.json({
      success: true,
      data: {
        growth: {
          revenue: { value: thisRevenue, growth: revenueGrowth, lastMonth: lastRevenue },
          leads: { value: thisMonthLeads, growth: leadsGrowth, lastMonth: lastMonthLeads },
          deals: { value: thisMonthDeals, growth: dealsGrowth, lastMonth: lastMonthDeals },
        },
        pipelineHealthScore,
        topPerformer: topPerformer[0]
          ? {
              name: topPerformer[0].user.name,
              deals: topPerformer[0].deals,
              revenue: topPerformer[0].revenue,
            }
          : null,
        industryBreakdown,
        forecast: {
          nextMonthRevenue: forecastRevenue,
          confidence: last3Months.length >= 3 ? "High" : "Medium",
        },
        riskAlerts: highRiskCustomers,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardMetrics, getRecommendations, getAIInsights };
