// ─────────────────────────────────────────────────────────────
//  Activity Routes — Audit Trail
// ─────────────────────────────────────────────────────────────
const express = require("express");
const Activity = require("../models/Activity");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

// Get recent activities
router.get("/recent", async (req, res, next) => {
  try {
    const { limit = 50 } = req.query;
    const activities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .populate("performedBy", "name email");

    res.json({ success: true, count: activities.length, data: activities });
  } catch (error) {
    next(error);
  }
});

// Get activities for specific entity
router.get("/:entityType/:entityId", async (req, res, next) => {
  try {
    const { entityType, entityId } = req.params;
    const activities = await Activity.find({ entityType, entityId })
      .sort({ createdAt: -1 })
      .populate("performedBy", "name email");

    res.json({ success: true, count: activities.length, data: activities });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
