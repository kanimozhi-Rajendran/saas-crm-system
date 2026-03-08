// ─────────────────────────────────────────────────────────────
//  Chatbot Routes — CRM Copilot
// ─────────────────────────────────────────────────────────────
const express = require("express");
const { sendMessage } = require("../controllers/chatbotController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.post("/message", sendMessage);

module.exports = router;
