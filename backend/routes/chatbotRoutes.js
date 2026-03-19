const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

router.post("/message", protect, async (req, res) => {
  const msg = req.body.message?.toLowerCase() || "";
  let reply = "I can help with leads, deals, tickets, revenue!";
  if (msg.includes("lead")) reply = "Check Leads page for AI-scored leads!";
  if (msg.includes("deal")) reply = "Check Deals page for probability predictions!";
  if (msg.includes("ticket")) reply = "Check Tickets page for support issues!";
  if (msg.includes("revenue")) reply = "Check Analytics for revenue trends!";
  res.json({ success: true, data: { reply, timestamp: new Date() }});
});

module.exports = router;