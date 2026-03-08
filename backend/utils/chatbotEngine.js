// ─────────────────────────────────────────────────────────────
//  Chatbot Engine — CRM Copilot NLP Response System
// ─────────────────────────────────────────────────────────────
const Lead = require("../models/Lead");
const Deal = require("../models/Deal");
const Ticket = require("../models/Ticket");
const Customer = require("../models/Customer");
const { generateRecommendations } = require("./aiEngine");

/**
 * Process user message and return intelligent response
 * @param {String} message - User input
 * @param {Object} context - User context (userId, role)
 * @returns {Object} { reply, data, intent, timestamp }
 */
const processMessage = async (message, context) => {
  const msg = message.toLowerCase().trim();
  let intent = "unknown";
  let reply = "";
  let data = null;

  try {
    // ── Intent: Leads ──────────────────────────────────────────
    if (msg.includes("lead") || msg.includes("prospect")) {
      intent = "leads";
      const totalLeads = await Lead.countDocuments();
      const topLeads = await Lead.find()
        .sort({ leadScore: -1 })
        .limit(5)
        .select("name company leadScore leadCategory");

      reply = `You have ${totalLeads} total leads. Here are your top 5 scored leads:`;
      data = topLeads.map((l) => ({
        name: l.name,
        company: l.company,
        score: l.leadScore,
        category: l.leadCategory,
      }));
    }

    // ── Intent: Deals ──────────────────────────────────────────
    else if (msg.includes("deal") || msg.includes("pipeline")) {
      intent = "deals";
      const activeDeals = await Deal.countDocuments({ isActive: true });
      const pipelineValue = await Deal.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, total: { $sum: "$value" } } },
      ]);
      const topDeals = await Deal.find({ isActive: true })
        .sort({ dealProbability: -1 })
        .limit(5)
        .select("title value dealProbability stage");

      const totalValue = pipelineValue[0]?.total || 0;
      reply = `You have ${activeDeals} active deals worth $${totalValue.toLocaleString()}. Top 5 by probability:`;
      data = topDeals.map((d) => ({
        title: d.title,
        value: d.value,
        probability: d.dealProbability,
        stage: d.stage,
      }));
    }

    // ── Intent: Revenue ────────────────────────────────────────
    else if (msg.includes("revenue") || msg.includes("money") || msg.includes("sales")) {
      intent = "revenue";
      const closedDeals = await Deal.aggregate([
        { $match: { stage: "Closed Won" } },
        {
          $group: {
            _id: { month: { $month: "$actualCloseDate" }, year: { $year: "$actualCloseDate" } },
            revenue: { $sum: "$value" },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": -1, "_id.month": -1 } },
        { $limit: 3 },
      ]);

      const totalRevenue = await Deal.aggregate([
        { $match: { stage: "Closed Won" } },
        { $group: { _id: null, total: { $sum: "$value" } } },
      ]);

      reply = `Total revenue: $${(totalRevenue[0]?.total || 0).toLocaleString()}. Recent monthly breakdown:`;
      data = closedDeals.map((m) => ({
        month: `${m._id.year}-${String(m._id.month).padStart(2, "0")}`,
        revenue: m.revenue,
        deals: m.count,
      }));
    }

    // ── Intent: Tickets ────────────────────────────────────────
    else if (msg.includes("ticket") || msg.includes("support") || msg.includes("issue")) {
      intent = "tickets";
      const openTickets = await Ticket.countDocuments({ status: { $in: ["Open", "In Progress"] } });
      const criticalTickets = await Ticket.find({
        priority: "Critical",
        status: { $nin: ["Resolved", "Closed"] },
      })
        .limit(5)
        .select("title priority status customer")
        .populate("customer", "name");

      reply = `You have ${openTickets} open tickets. ${criticalTickets.length} critical tickets need attention:`;
      data = criticalTickets.map((t) => ({
        title: t.title,
        priority: t.priority,
        status: t.status,
        customer: t.customer?.name || "Unknown",
      }));
    }

    // ── Intent: Recommendations ────────────────────────────────
    else if (msg.includes("recommend") || msg.includes("suggest") || msg.includes("action")) {
      intent = "recommend";
      const [leads, deals, tickets, customers] = await Promise.all([
        Lead.find({ status: { $nin: ["Converted", "Lost"] } })
          .sort({ leadScore: -1 })
          .limit(30),
        Deal.find({ isActive: true }).sort({ dealProbability: -1 }).limit(30),
        Ticket.find({ status: { $nin: ["Resolved", "Closed"] } }).limit(30),
        Customer.find().sort({ totalRevenue: -1 }).limit(30),
      ]);

      const recommendations = generateRecommendations({ leads, deals, tickets, customers });
      reply = `I've analyzed your CRM data. Here are the top ${Math.min(recommendations.length, 5)} AI recommendations:`;
      data = recommendations.slice(0, 5);
    }

    // ── Intent: Churn ──────────────────────────────────────────
    else if (msg.includes("churn") || msg.includes("risk") || msg.includes("leaving")) {
      intent = "churn";
      // This would require churn calculation - placeholder for now
      reply = "Churn prediction requires customer-specific analysis. Please specify a customer or check the Customers page for churn risk indicators.";
      data = { message: "Navigate to Customers page to view churn predictions" };
    }

    // ── Intent: Help ───────────────────────────────────────────
    else if (msg.includes("help") || msg.includes("what can you") || msg.includes("command")) {
      intent = "help";
      reply = "I'm your CRM Copilot! I can help you with:";
      data = [
        { command: "leads", description: "Show lead count and top scored leads" },
        { command: "deals", description: "Show active deals and pipeline value" },
        { command: "revenue", description: "Show revenue summary and trends" },
        { command: "tickets", description: "Show open and critical support tickets" },
        { command: "recommend", description: "Get AI-powered action recommendations" },
        { command: "churn", description: "View customer churn risk analysis" },
      ];
    }

    // ── Intent: Greeting ───────────────────────────────────────
    else if (
      msg.includes("hi") ||
      msg.includes("hello") ||
      msg.includes("hey") ||
      msg.includes("good morning") ||
      msg.includes("good afternoon")
    ) {
      intent = "greeting";
      reply = `Hello! I'm your AI CRM Copilot. How can I assist you today? Try asking about leads, deals, revenue, or recommendations.`;
      data = null;
    }

    // ── Intent: Unknown ────────────────────────────────────────
    else {
      intent = "unknown";
      reply =
        "I'm not sure I understand. Try asking about 'leads', 'deals', 'revenue', 'tickets', or 'recommendations'. Type 'help' to see all commands.";
      data = null;
    }
  } catch (error) {
    console.error("Chatbot processing error:", error);
    reply = "Sorry, I encountered an error processing your request. Please try again.";
    intent = "error";
    data = null;
  }

  return {
    reply,
    data,
    intent,
    timestamp: new Date(),
  };
};

module.exports = { processMessage };
