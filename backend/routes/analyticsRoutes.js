const express = require("express");
const { getDashboardMetrics, getRecommendations } = require("../controllers/analyticsController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const router = express.Router();

router.use(protect);

router.get("/dashboard", getDashboardMetrics);
router.get("/recommendations", getRecommendations);

module.exports = router;