// ─────────────────────────────────────────────────────────────
//  Export Routes — CSV & PDF Generation
// ─────────────────────────────────────────────────────────────
const express = require("express");
const { exportLeadsCSV, exportDealsCSV, exportAnalyticsPDF } = require("../controllers/exportController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(protect);
router.use(authorize("Admin"));

router.get("/leads/csv", exportLeadsCSV);
router.get("/deals/csv", exportDealsCSV);
router.get("/analytics/pdf", exportAnalyticsPDF);

module.exports = router;
