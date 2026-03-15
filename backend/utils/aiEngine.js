// ═══════════════════════════════════════════════════════════════
//  AI Engine — Core Intelligence Module
//  Implements:
//    1. Lead Scoring (weighted feature model)
//    2. Deal Success Prediction (logistic regression style)
//    3. Smart Recommendations
// ═══════════════════════════════════════════════════════════════

// ── 1. LEAD SCORING SYSTEM ────────────────────────────────────
/**
 * Calculates a lead score (0-100) based on weighted features.
 *
 * Feature Weights:
 *  - Budget              → 30 points max
 *  - Company Size        → 20 points max
 *  - Interaction Count   → 20 points max
 *  - Email Response Rate → 20 points max
 *  - Previous Conversion → 10 points max (binary bonus)
 *
 * @param {Object} leadData - Lead attributes
 * @returns {{ score: number, category: string, breakdown: Object }}
 */
const calculateLeadScore = (leadData) => {
  const {
    budget = 0,
    companySize = "1-10",
    interactionCount = 0,
    emailResponseRate = 0,
    previousConversion = false,
  } = leadData;

  // ── Budget Score (0–30) ──────────────────────────────────────
  // Normalize budget to 0-30 scale using log scale (handles wide range)
  let budgetScore = 0;
  if (budget >= 100000) budgetScore = 30;
  else if (budget >= 50000) budgetScore = 25;
  else if (budget >= 20000) budgetScore = 20;
  else if (budget >= 10000) budgetScore = 15;
  else if (budget >= 5000) budgetScore = 10;
  else if (budget >= 1000) budgetScore = 5;
  else budgetScore = 2;

  // ── Company Size Score (0–20) ────────────────────────────────
  const companySizeMap = {
    "1-10": 4,
    "11-50": 8,
    "51-200": 13,
    "201-500": 17,
    "500+": 20,
  };
  const companySizeScore = companySizeMap[companySize] || 4;

  // ── Interaction Score (0–20) ─────────────────────────────────
  // Each interaction worth ~2 pts, capped at 20
  const interactionScore = Math.min(interactionCount * 2, 20);

  // ── Email Response Score (0–20) ──────────────────────────────
  // Direct percentage mapped to 0-20 scale
  const emailScore = Math.round((emailResponseRate / 100) * 20);

  // ── Previous Conversion Bonus (0 or 10) ──────────────────────
  const conversionBonus = previousConversion ? 10 : 0;

  // ── Aggregate ────────────────────────────────────────────────
  const rawScore = budgetScore + companySizeScore + interactionScore + emailScore + conversionBonus;
  const score = Math.min(Math.max(Math.round(rawScore), 0), 100);

  // ── Categorize ───────────────────────────────────────────────
  let category;
  if (score <= 40) category = "Low";
  else if (score <= 70) category = "Medium";
  else category = "High";

  return {
    score,
    category,
    breakdown: {
      budgetScore,
      companySizeScore,
      interactionScore,
      emailScore,
      conversionBonus,
    },
  };
};

// ── 2. DEAL SUCCESS PREDICTION ────────────────────────────────
/**
 * Predicts probability of closing a deal using a logistic-regression-inspired
 * weighted scoring model.
 *
 * Feature contributions:
 *  - Pipeline Stage        → 0–35 pts
 *  - Lead Score            → 0–20 pts
 *  - Deal Value            → 0-15 pts
 *  - Budget Confirmed      → 0–15 pts
 *  - Has Champion          → 0–15 pts
 *  - Stakeholder Count     → 2–10 pts (2-3 optimal)
 *  - Competitor Count      → 0 to -15 pts (penalty)
 *  - Days in Pipeline      → 0 to -15 pts (decay)
 *
 * Passed through sigmoid-like normalization to produce 0-100 probability.
 *
 * @param {Object} dealData
 * @returns {{ probability: number, status: string, insights: string[] }}
 */
const predictDealSuccess = (dealData) => {
  const {
    stage = "Prospecting",
    leadScore = 0,
    daysInPipeline = 0,
    competitorCount = 0,
    stakeholderCount = 1,
    hasBudgetConfirmed = false,
    hasChampion = false,
    value = 0,
  } = dealData;

  // ── Stage Weight (progress through funnel) ───────────────────
  // Maximum 35 points
  const stageWeights = {
    Prospecting: 5,
    Qualification: 10,
    Proposal: 20,
    Negotiation: 30,
    "Closed Won": 35,
    "Closed Lost": 0,
  };
  const stageScore = stageWeights[stage] || 5;

  // ── Lead Score Contribution (0–20) ───────────────────────────
  // Proportional based on 0-100 score
  const leadScoreContribution = Math.round((leadScore / 100) * 20);

  // ── Deal Value Bonus (0-15) ──────────────────────────────────
  // High-value deals generally get more organizational focus to close
  let valueBonus = 0;
  if (value >= 100000) valueBonus = 15;
  else if (value >= 50000) valueBonus = 10;
  else if (value >= 10000) valueBonus = 5;
  else if (value > 0) valueBonus = 2;

  // ── Budget Confirmed Bonus ────────────────────────────────────
  // Critical for closing (15 points)
  const budgetScore = hasBudgetConfirmed ? 15 : 0;

  // ── Champion Bonus ────────────────────────────────────────────
  // An internal advocate is a strong signal (15 points)
  const championScore = hasChampion ? 15 : 0;

  // ── Stakeholder Score (more stakeholders = harder to close, but validated if optimal) ─
  // Optimal is 2-3 stakeholders (10 points). 1 is too few (5 pts). >4 bogs deals down (2 pts).
  let stakeholderScore = 5; 
  if (stakeholderCount >= 2 && stakeholderCount <= 3) stakeholderScore = 10;
  else if (stakeholderCount > 3) stakeholderScore = 2;

  // ── Competitor Penalty ────────────────────────────────────────
  // More competitors = lower probability (-3 per competitor, max -15)
  const competitorPenalty = Math.min(competitorCount * 3, 15);

  // ── Pipeline Decay (deal aging penalty) ──────────────────────
  // After 30 days, deal starts losing confidence (-1 pt every 5 days, max -15 pts)
  let decayPenalty = 0;
  if (daysInPipeline > 30) {
     decayPenalty = Math.min(Math.round((daysInPipeline - 30) / 5), 15);
  }

  // ── Raw Score ────────────────────────────────────────────────
  const rawScore =
    stageScore +
    leadScoreContribution +
    valueBonus +
    budgetScore +
    championScore +
    stakeholderScore -
    competitorPenalty -
    decayPenalty;

  // ── Normalize to 0–100 using sigmoid-like function ───────────
  // Adjusted baseline so 50 raw score = 50% probability
  const sigmoid = (x) => Math.round(100 / (1 + Math.exp(-0.08 * (x - 50))));
  const probability = Math.min(Math.max(sigmoid(rawScore), 1), 99);

  // ── Status Label ─────────────────────────────────────────────
  let status;
  if (stage === "Closed Won") {
    status = "Deal closed successfully";
  } else if (stage === "Closed Lost") {
    status = "Deal lost";
  } else if (probability >= 70) {
    status = "High chance of closing";
  } else if (probability >= 40) {
    status = "Moderate chance of closing";
  } else if (probability >= 20) {
    status = "Deal at risk";
  } else {
    status = "Low probability — needs attention";
  }

  // ── Insights Array ────────────────────────────────────────────
  const insights = [];
  if (!hasBudgetConfirmed) insights.push("Confirm budget to increase deal confidence");
  if (!hasChampion) insights.push("Identify an internal champion at the client");
  if (competitorCount > 2) insights.push(`High competition (${competitorCount} vendors) — differentiate value proposition`);
  if (daysInPipeline > 60) insights.push(`Deal has been open for ${daysInPipeline} days — escalate or push for decision`);
  if (stakeholderCount === 1) insights.push("Single-threaded deal — engage more stakeholders to reduce risk");
  if (leadScore < 40 && leadScore > 0) insights.push(`Lead score is low (${leadScore}) — verify opportunity quality`);
  if (probability >= 70 && stage !== "Closed Won") insights.push("Strong deal — prioritize resources to close quickly");

  return { probability, status, insights };
};

// ── 3. SMART RECOMMENDATIONS ENGINE ──────────────────────────
/**
 * Generates context-aware CRM recommendations for a user's portfolio.
 *
 * @param {Object} data - { leads, deals, tickets, customers }
 * @returns {Array<{ type: string, message: string, priority: string, entityId: string }>}
 */
const generateRecommendations = ({ leads = [], deals = [], tickets = [], customers = [] }) => {
  const recommendations = [];

  // ── Lead Recommendations ─────────────────────────────────────
  leads.forEach((lead) => {
    // Hot lead not yet contacted
    if (lead.leadCategory === "High" && lead.status === "New") {
      recommendations.push({
        type: "lead",
        icon: "🔥",
        message: `High-value lead "${lead.name}" detected — contact immediately`,
        priority: "High",
        entityId: lead._id,
        action: "Follow up now",
      });
    }
    // Stale leads (more than 7 days with no status change)
    const daysSinceUpdate = Math.floor(
      (Date.now() - new Date(lead.updatedAt)) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceUpdate > 7 && !["Converted", "Lost"].includes(lead.status)) {
      recommendations.push({
        type: "lead",
        icon: "⏰",
        message: `Lead "${lead.name}" has been inactive for ${daysSinceUpdate} days`,
        priority: "Medium",
        entityId: lead._id,
        action: "Follow up this lead",
      });
    }
  });

  // ── Deal Recommendations ─────────────────────────────────────
  deals.forEach((deal) => {
    if (deal.dealProbability >= 75 && deal.stage !== "Closed Won") {
      recommendations.push({
        type: "deal",
        icon: "💰",
        message: `Deal "${deal.title}" has ${deal.dealProbability}% close probability — prioritize it`,
        priority: "High",
        entityId: deal._id,
        action: "Schedule closing call",
      });
    }
    if (deal.dealProbability < 30 && deal.isActive) {
      recommendations.push({
        type: "deal",
        icon: "⚠️",
        message: `Deal "${deal.title}" is at risk (${deal.dealProbability}% probability)`,
        priority: "High",
        entityId: deal._id,
        action: "Review deal strategy",
      });
    }
    // Deal closing deadline approaching
    if (deal.closeDate) {
      const daysToClose = Math.floor((new Date(deal.closeDate) - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysToClose <= 7 && daysToClose >= 0 && deal.stage !== "Closed Won") {
        recommendations.push({
          type: "deal",
          icon: "📅",
          message: `Deal "${deal.title}" close date is in ${daysToClose} day(s)`,
          priority: "High",
          entityId: deal._id,
          action: "Finalize proposal",
        });
      }
    }
  });

  // ── Customer Recommendations ─────────────────────────────────
  customers.forEach((customer) => {
    if (customer.totalRevenue > 50000) {
      recommendations.push({
        type: "customer",
        icon: "⭐",
        message: `High-value customer "${customer.name}" — consider upsell opportunity`,
        priority: "Medium",
        entityId: customer._id,
        action: "Schedule QBR",
      });
    }
  });

  // ── Ticket Recommendations ────────────────────────────────────
  const criticalTickets = tickets.filter((t) => t.priority === "Critical" && t.status !== "Resolved");
  if (criticalTickets.length > 0) {
    recommendations.push({
      type: "ticket",
      icon: "🚨",
      message: `${criticalTickets.length} critical support ticket(s) unresolved`,
      priority: "High",
      entityId: null,
      action: "Resolve critical tickets",
    });
  }

  // Sort by priority: High → Medium → Low
  const priorityOrder = { High: 0, Medium: 1, Low: 2 };
  return recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
};

module.exports = { calculateLeadScore, predictDealSuccess, generateRecommendations };


// ── 4. CUSTOMER CHURN PREDICTION ──────────────────────────────
/**
 * Predicts customer churn risk (0-100) based on engagement and health metrics.
 *
 * Risk Factors:
 *  - Recency (days since last interaction)
 *  - Ticket stress (open tickets count)
 *  - Engagement level (interaction frequency)
 *  - Revenue contribution
 *  - Deal activity
 *
 * @param {Object} customerData
 * @returns {{ churnProbability: number, riskLevel: string, actions: string[], breakdown: Object }}
 */
const predictCustomerChurn = (customerData) => {
  const {
    daysSinceLastInteraction = 0,
    totalRevenue = 0,
    openTicketsCount = 0,
    resolvedTicketsCount = 0,
    dealCount = 0,
    interactionCount = 0,
    previousConversion = false,
  } = customerData;

  // ── Recency Score (0-40) ─────────────────────────────────────
  // More days = higher churn risk
  let recencyScore = 0;
  if (daysSinceLastInteraction <= 30) recencyScore = 0;
  else if (daysSinceLastInteraction <= 60) recencyScore = 10;
  else if (daysSinceLastInteraction <= 90) recencyScore = 20;
  else if (daysSinceLastInteraction <= 180) recencyScore = 30;
  else recencyScore = 40;

  // ── Ticket Stress Score (0-20) ───────────────────────────────
  // Unresolved tickets indicate dissatisfaction
  let ticketStressScore = 0;
  if (openTicketsCount >= 5) ticketStressScore = 20;
  else if (openTicketsCount >= 3) ticketStressScore = 10;
  else if (openTicketsCount >= 1) ticketStressScore = 5;
  else ticketStressScore = 0;

  // ── Engagement Score (0-20) ──────────────────────────────────
  // Low interaction = disengagement
  let engagementScore = 0;
  if (interactionCount >= 20) engagementScore = 0;
  else if (interactionCount >= 10) engagementScore = 5;
  else if (interactionCount >= 5) engagementScore = 10;
  else engagementScore = 20;

  // ── Revenue Score (0-15) ─────────────────────────────────────
  // Low revenue customers are higher churn risk
  let revenueScore = 0;
  if (totalRevenue >= 50000) revenueScore = 0;
  else if (totalRevenue >= 10000) revenueScore = 5;
  else if (totalRevenue >= 1000) revenueScore = 10;
  else revenueScore = 15;

  // ── Deal Score (0-10) ────────────────────────────────────────
  // Active deals indicate ongoing engagement
  let dealScore = 0;
  if (dealCount >= 3) dealScore = 0;
  else if (dealCount >= 1) dealScore = 5;
  else dealScore = 10;

  // ── Aggregate Churn Risk ─────────────────────────────────────
  const rawChurnRisk =
    recencyScore + ticketStressScore + engagementScore + revenueScore + dealScore;
  const churnProbability = Math.min(Math.max(Math.round(rawChurnRisk), 0), 100);

  // ── Risk Level ───────────────────────────────────────────────
  let riskLevel;
  if (churnProbability <= 20) riskLevel = "Low";
  else if (churnProbability <= 50) riskLevel = "Medium";
  else if (churnProbability <= 75) riskLevel = "High";
  else riskLevel = "Critical";

  // ── Recommended Actions ──────────────────────────────────────
  const actions = [];
  if (recencyScore > 20) actions.push("Schedule immediate check-in call");
  if (ticketStressScore > 10) actions.push("Resolve open support tickets urgently");
  if (engagementScore > 10) actions.push("Increase touchpoint frequency");
  if (churnProbability > 75) actions.push("Escalate to Account Manager");
  if (dealCount === 0 && totalRevenue > 0) actions.push("Identify upsell opportunities");
  if (actions.length === 0) actions.push("Continue regular engagement cadence");

  return {
    churnProbability,
    riskLevel,
    actions,
    breakdown: {
      recencyScore,
      ticketStressScore,
      engagementScore,
      revenueScore,
      dealScore,
    },
  };
};

module.exports = { calculateLeadScore, predictDealSuccess, generateRecommendations, predictCustomerChurn };
