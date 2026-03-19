const processMessage = (message) => {
  const msg = message?.toLowerCase() || "";
  if (msg.includes("lead")) return { reply: "Check Leads page!", intent: "leads" };
  if (msg.includes("deal")) return { reply: "Check Deals page!", intent: "deals" };
  if (msg.includes("ticket")) return { reply: "Check Tickets page!", intent: "tickets" };
  if (msg.includes("revenue")) return { reply: "Check Analytics page!", intent: "revenue" };
  return { reply: "Ask me about leads, deals, tickets or revenue!", intent: "unknown" };
};
module.exports = { processMessage };
