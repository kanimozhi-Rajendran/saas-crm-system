const express = require("express");
const { getDashboardMetrics, getRecommendations, getAIInsights } = require("../controllers/analyticsController_enhanced");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const router = express.Router();

router.use(protect);

router.get("/dashboard", getDashboardMetrics);
router.get("/recommendations", getRecommendations);
router.get("/ai-insights", getAIInsights);

module.exports = router;