const express = require("express");
const {
  createTicket, getTickets, getTicketById, updateTicket, addComment,
} = require("../controllers/ticketController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router.use(protect);

router.route("/").get(getTickets).post(createTicket);
router.route("/:id").get(getTicketById).put(updateTicket);
router.post("/:id/comments", addComment);

module.exports = router;