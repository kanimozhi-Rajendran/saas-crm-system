const express = require("express");
const {
  createDeal, getDeals, getDealById, updateDeal, deleteDeal,
} = require("../controllers/dealController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const router = express.Router();

router.use(protect);

router.route("/").get(getDeals).post(createDeal);
router.route("/:id")
  .get(getDealById)
  .put(updateDeal)
  .delete(authorize("Admin"), deleteDeal);

module.exports = router;