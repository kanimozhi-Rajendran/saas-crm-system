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

module.exports = { 
  getDashboardMetrics, 
  getRecommendations,
};
