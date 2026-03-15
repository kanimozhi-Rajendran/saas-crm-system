const { predictDealSuccess } = require("./backend/utils/aiEngine.js");

const deals = [
  {
    name: "Perfect Deal",
    data: {
      stage: "Negotiation", // 30
      leadScore: 90, // 18
      value: 120000, // 15
      hasBudgetConfirmed: true, // 15
      hasChampion: true, // 15
      stakeholderCount: 3, // 10
      competitorCount: 0, // 0
      daysInPipeline: 10, // 0
    } // Total Raw: 103 -> Very High %
  },
  {
    name: "Struggling Deal",
    data: {
      stage: "Qualification", // 10
      leadScore: 30, // 6
      value: 5000, // 2
      hasBudgetConfirmed: false, // 0
      hasChampion: false, // 0
      stakeholderCount: 6, // 2
      competitorCount: 3, // -9
      daysInPipeline: 45, // -3
    } // Total Raw: 8 -> Very Low %
  },
  {
    name: "Average Deal",
    data: {
      stage: "Proposal", // 20
      leadScore: 65, // 13
      value: 25000, // 5
      hasBudgetConfirmed: true, // 15
      hasChampion: false, // 0
      stakeholderCount: 2, // 10
      competitorCount: 1, // -3
      daysInPipeline: 20, // 0
    } // Total Raw: 60 -> ~69%
  }
]

deals.forEach(d => {
  const result = predictDealSuccess(d.data);
  console.log(`\n--- ${d.name} ---`);
  console.log(`Probability: ${result.probability}%`);
  console.log(`Status: ${result.status}`);
  console.log(`Insights:`, result.insights);
});
