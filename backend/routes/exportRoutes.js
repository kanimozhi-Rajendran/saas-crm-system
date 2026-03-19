const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const Lead = require("../models/Lead");
const Deal = require("../models/Deal");

router.get("/leads/csv", protect, authorize("Admin"), async (req, res) => {
  try {
    const leads = await Lead.find().lean();
    const headers = ["Name","Email","Company","Budget","Lead Score","Category","Status"];
    const rows = leads.map(l => [l.name,l.email,l.company,l.budget,l.leadScore,l.leadCategory,l.status]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=leads.csv");
    res.send(csv);
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get("/deals/csv", protect, authorize("Admin"), async (req, res) => {
  try {
    const deals = await Deal.find().lean();
    const headers = ["Title","Value","Stage","Probability","Status"];
    const rows = deals.map(d => [d.title,d.value,d.stage,d.dealProbability,d.dealPredictionStatus]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=deals.csv");
    res.send(csv);
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;