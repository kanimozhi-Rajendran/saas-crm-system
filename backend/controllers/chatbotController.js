// ─────────────────────────────────────────────────────────────
//  Chatbot Controller — CRM Copilot API
// ─────────────────────────────────────────────────────────────
const { processMessage } = require("../utils/chatbotEngine");

// ── @route  POST /api/chatbot/message ─────────────────────────
const sendMessage = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    const context = {
      userId: req.user._id,
      role: req.user.role,
      userName: req.user.name,
    };

    const response = await processMessage(message, context);

    res.json({
      success: true,
      response,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { sendMessage };
