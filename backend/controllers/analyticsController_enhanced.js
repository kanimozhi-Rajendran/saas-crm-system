// ═══════════════════════════════════════════════════════════════
//  ENHANCED Analytics Controller — Complete CRM Dashboard Metrics
// ═══════════════════════════════════════════════════════════════
const Customer = require("../models/Customer");
const Lead = require("../models/Lead");
const Deal = require("../models/Deal");
const Ticket = require("../models/Ticket");
const Activity = require("../models/Activity");
const { generateRecommendations } = require("../utils/aiEngine");

// ── @route  GET /api/analytics/dashboard ─────────────────────
// ── @desc   Get comprehensive dashboard metrics
// ── @access Protected
const getDashboardMetrics = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // ═══════════════════════════════════════════════════════════
    // PARALLEL AGGREGATION QUERIES FOR OPTIMAL PERFORMANCE
    // ═══════════════════════════════════════════════════════════
    const [
      // ── Lead Metrics ─────────────────────────────────────────
      totalLeads,
      newLeadsThisMonth,
      newLeadsLastMonth,
      convertedLeads,
      leadsByCategory,
      topLeads,

      // ── Customer Metrics ─────────────────────────────────────
      totalCustomers,
      newCustomersThisMonth,
      newCustomersLastMonth,
      customersByIndustry,

      // ── Deal Metrics ─────────────────────────────────────────
      totalDeals,
      activeDeals,
      closedWonDeals,
      closedLostDeals,
      dealsByStage,
      
      // ── Additions For Chart Visualizations ───────────────────
      leadFunnel,
      dealSuccessDistribution,
      dealsWonLost,

      // ── Deal Value Metrics ───────────────────────────────────
      totalDealValue,
      avgDealValue,
      closedWonValue,
      pipelineValue,
      
      // ── Ticket Metrics ───────────────────────────────────────
      totalTickets,
      openTickets,
      resolvedTickets,
      criticalTickets,
      avgResolutionTime,
      ticketsByPriority,

      // ── Time-based Metrics ───────────────────────────────────
      monthlyRevenue,
      weeklyDeals,

      // ── Recent Activities ────────────────────────────────────
      recentActivities,

    ] = await Promise.all([
      // ── Lead Queries ─────────────────────────────────────────
      Lead.countDocuments(),
      Lead.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Lead.countDocuments({ 
        createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } 
      }),
      Lead.countDocuments({ status: "Converted" }),
      Lead.aggregate([
        { $group: { _id: "$leadCategory", count: { $sum: 1 } } },
      ]),
      Lead.find()
        .sort({ leadScore: -1 })
        .limit(5)
        .select("name company leadScore leadCategory")
        .lean(),

      // ── Customer Queries ─────────────────────────────────────
      Customer.countDocuments(),
      Customer.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Customer.countDocuments({ 
        createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } 
      }),
      Customer.aggregate([
        { $group: { _id: "$industry", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),

      // ── Deal Queries ─────────────────────────────────────────
      Deal.countDocuments(),
      Deal.countDocuments({ 
        isActive: true, 
        stage: { $nin: ["Closed Won", "Closed Lost"] } 
      }),
      Deal.countDocuments({ stage: "Closed Won" }),
      Deal.countDocuments({ stage: "Closed Lost" }),
      Deal.aggregate([
        { 
          $group: { 
            _id: "$stage", 
            count: { $sum: 1 }, 
            totalValue: { $sum: "$value" } 
          } 
        },
        { $sort: { totalValue: -1 } },
      ]),

      // ── Additions For Chart Visualizations ───────────────────
      // Lead Conversion Funnel
      Lead.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),
      
      // Deal Success Distribution
      Deal.aggregate([
        { $match: { isActive: true, stage: { $nin: ["Closed Won", "Closed Lost"] } } },
        { $group: { _id: "$dealPredictionStatus", count: { $sum: 1 } } }
      ]),

      // Deals Won vs Lost
      Deal.aggregate([
        { $match: { stage: { $in: ["Closed Won", "Closed Lost"] } } },
        { $group: { _id: "$stage", count: { $sum: 1 } } }
      ]),

      // ── Deal Value Queries ───────────────────────────────────
      Deal.aggregate([
        { $group: { _id: null, total: { $sum: "$value" } } },
      ]),
      Deal.aggregate([
        { $group: { _id: null, avg: { $avg: "$value" } } },
      ]),
      Deal.aggregate([
        { $match: { stage: "Closed Won" } },
        { $group: { _id: null, total: { $sum: "$value" } } },
      ]),
      Deal.aggregate([
        { 
          $match: { 
            isActive: true, 
            stage: { $nin: ["Closed Won", "Closed Lost"] } 
          } 
        },
        { $group: { _id: null, total: { $sum: "$value" } } },
      ]),

      // ── Ticket Queries ───────────────────────────────────────
      Ticket.countDocuments(),
      Ticket.countDocuments({ status: { $in: ["Open", "In Progress"] } }),
      Ticket.countDocuments({ status: "Resolved" }),
      Ticket.countDocuments({ 
        priority: "Critical", 
        status: { $nin: ["Resolved", "Closed"] } 
      }),
      Ticket.aggregate([
        { $match: { resolutionTimeHours: { $ne: null } } },
        { $group: { _id: null, avg: { $avg: "$resolutionTimeHours" } } },
      ]),
      Ticket.aggregate([
        { $group: { _id: "$priority", count: { $sum: 1 } } },
      ]),

      // ── Time-based Queries ───────────────────────────────────
      Deal.aggregate([
        { 
          $match: { 
            stage: "Closed Won", 
            actualCloseDate: { $exists: true } 
          } 
        },
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
        { $sort: { "_id.year": -1, "_id.month": -1 } },
        { $limit: 6 },
      ]),
      Deal.aggregate([
        { 
          $match: { 
            createdAt: { 
              $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
            } 
          } 
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // ── Activity Queries ─────────────────────────────────────
      Activity.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("performedBy", "name email")
        .lean(),
    ]);

    // ═══════════════════════════════════════════════════════════
    // CALCULATE DERIVED METRICS
    // ═══════════════════════════════════════════════════════════

    // Lead Conversion Rate
    const leadConversionRate = totalLeads > 0 
      ? Math.round((convertedLeads / totalLeads) * 100) 
      : 0;

    // Lead Growth Rate (MoM)
    const leadGrowthRate = newLeadsLastMonth > 0
      ? Math.round(((newLeadsThisMonth - newLeadsLastMonth) / newLeadsLastMonth) * 100)
      : 0;

    // Customer Growth Rate (MoM)
    const customerGrowthRate = newCustomersLastMonth > 0
      ? Math.round(((newCustomersThisMonth - newCustomersLastMonth) / newCustomersLastMonth) * 100)
      : 0;

    // Deal Win Rate
    const totalClosedDeals = closedWonDeals + closedLostDeals;
    const dealWinRate = totalClosedDeals > 0
      ? Math.round((closedWonDeals / totalClosedDeals) * 100)
      : 0;

    // Average Deal Value
    const averageDealValue = Math.round(avgDealValue[0]?.avg || 0);

    // Total Deal Value
    const totalDealValueAmount = totalDealValue[0]?.total || 0;

    // Closed Won Revenue
    const totalRevenue = closedWonValue[0]?.total || 0;

    // Pipeline Value (Active Deals)
    const totalPipelineValue = pipelineValue[0]?.total || 0;

    // Average Resolution Time
    const avgResolutionTimeHours = Math.round(avgResolutionTime[0]?.avg || 0);

    // Ticket Resolution Rate
    const ticketResolutionRate = totalTickets > 0
      ? Math.round((resolvedTickets / totalTickets) * 100)
      : 0;

    // ═══════════════════════════════════════════════════════════
    // FORMAT RESPONSE DATA
    // ═══════════════════════════════════════════════════════════

    res.json({
      success: true,
      timestamp: new Date(),
      data: {
        // ── Overview Metrics ─────────────────────────────────────
        overview: {
          // Lead Metrics
          totalLeads,
          newLeadsThisMonth,
          leadGrowthRate,
          convertedLeads,
          leadConversionRate,

          // Customer Metrics
          totalCustomers,
          newCustomersThisMonth,
          customerGrowthRate,

          // Deal Metrics
          totalDeals,
          activeDeals,
          closedWonDeals,
          closedLostDeals,
          dealWinRate,

          // Financial Metrics
          totalRevenue,
          totalDealValue: totalDealValueAmount,
          averageDealValue,
          totalPipelineValue,

          // Ticket Metrics
          totalTickets,
          openTickets,
          resolvedTickets,
          criticalTickets,
          avgResolutionTimeHours,
          ticketResolutionRate,
        },

        // ── Chart Data ───────────────────────────────────────────
        charts: {
          // Lead Distribution by AI Category
          leadsByCategory: leadsByCategory.reduce((acc, item) => {
            acc[item._id || "Unknown"] = item.count;
            return acc;
          }, {}),

          // Deals by Stage with Values
          dealsByStage: dealsByStage.map((d) => ({
            stage: d._id,
            count: d.count,
            value: d.totalValue,
          })),

          // Monthly Revenue Trend (Last 6 Months)
          monthlyRevenue: monthlyRevenue.map((m) => ({
            month: `${m._id.year}-${String(m._id.month).padStart(2, "0")}`,
            revenue: m.revenue,
            deals: m.count,
          })),

          // Weekly Deal Creation Trend
          weeklyDeals: weeklyDeals.map((d) => ({
            date: d._id,
            count: d.count,
          })),

          // Tickets by Priority
          ticketsByPriority: ticketsByPriority.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),

          // Customers by Industry
          customersByIndustry: customersByIndustry.map((c) => ({
            industry: c._id || "Unknown",
            count: c.count,
          })),

          // ── Additions For Chart Visualizations ───────────────────
          leadFunnel: leadFunnel.map((l) => ({
            status: l._id || "New",
            count: l.count,
          })),
          
          dealSuccessDistribution: dealSuccessDistribution.map((d) => ({
            predictionStatus: d._id || "Unknown",
            count: d.count,
          })),
          
          dealsWonLost: dealsWonLost.map((d) => ({
            stage: d._id,
            count: d.count,
          })),
        },

        // ── Top Performers ───────────────────────────────────────
        topPerformers: {
          topLeads: topLeads.map((l) => ({
            name: l.name,
            company: l.company,
            score: l.leadScore,
            category: l.leadCategory,
          })),
        },

        // ── Recent Activities ────────────────────────────────────
        recentActivities: recentActivities.map((a) => ({
          id: a._id,
          entityType: a.entityType,
          action: a.action,
          description: a.description,
          performedBy: a.performedBy?.name || "Unknown",
          timestamp: a.createdAt,
          timeAgo: getTimeAgo(a.createdAt),
        })),
      },
    });
  } catch (error) {
    console.error("Dashboard metrics error:", error);
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Calculate time ago from timestamp
 */
const getTimeAgo = (timestamp) => {
  const seconds = Math.floor((Date.now() - new Date(timestamp)) / 1000);
  
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(timestamp).toLocaleDateString();
};

// ── @route  GET /api/analytics/recommendations ────────────────
const getRecommendations = async (req, res, next) => {
  try {
    const [leads, deals, tickets, customers] = await Promise.all([
      Lead.find({ status: { $nin: ["Converted", "Lost"] } })
        .sort({ leadScore: -1 })
        .limit(50),
      Deal.find({ isActive: true })
        .sort({ dealProbability: -1 })
        .limit(50),
      Ticket.find({ status: { $nin: ["Resolved", "Closed"] } })
        .limit(50),
      Customer.find()
        .sort({ totalRevenue: -1 })
        .limit(50),
    ]);

    const recommendations = generateRecommendations({ 
      leads, 
      deals, 
      tickets, 
      customers 
    });

    res.json({
      success: true,
      count: recommendations.length,
      data: recommendations,
    });
  } catch (error) {
    next(error);
  }
};

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

module.exports = { 
  getDashboardMetrics, 
  getRecommendations,
  getAIInsights
};
