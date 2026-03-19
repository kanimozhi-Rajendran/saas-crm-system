const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const Activity = require("../models/Activity");

router.get("/recent", protect, async (req, res, next) => {
  try {
    const activities = await Activity.find()
      .populate("performedBy", "name role")
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ success: true, count: activities.length, data: activities });
  } catch (error) {
    next(error);
  }
});

module.exports = router;