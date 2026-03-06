const express = require("express");
const {
  createLead, getLeads, getLeadById, updateLead, deleteLead,
} = require("../controllers/leadController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const router = express.Router();

router.use(protect);

router.route("/")
  .get(getLeads)
  .post(createLead);

router.route("/:id")
  .get(getLeadById)
  .put(updateLead)
  .delete(authorize("Admin", "Sales"), deleteLead);

module.exports = router;
