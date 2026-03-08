// ─────────────────────────────────────────────────────────────
//  Socket Service — Real-time notifications via Socket.io
// ─────────────────────────────────────────────────────────────
const jwt = require("jsonwebtoken");
const User = require("../models/User");

let io = null;

// Initialize socket.io server
const initializeSocket = (server) => {
  const socketIO = require("socket.io");
  io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      credentials: true,
    },
  });

  // Authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error("Authentication error"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      if (!user) return next(new Error("User not found"));

      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`✅ Socket connected: ${socket.user.name} (${socket.user.role})`);

    // Join role-based rooms
    socket.join(socket.user.role);
    socket.join(`user_${socket.user._id}`);

    socket.on("disconnect", () => {
      console.log(`❌ Socket disconnected: ${socket.user.name}`);
    });
  });

  console.log("🔌 Socket.io initialized");
  return io;
};

// Get socket instance
const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};

// Emit new lead notification to Admin and Sales
const emitNewLead = (lead) => {
  if (!io) return;
  io.to("Admin").to("Sales").emit("new_lead", {
    type: "new_lead",
    message: `New lead: ${lead.name} (Score: ${lead.leadScore})`,
    data: lead,
    timestamp: new Date(),
  });
  console.log(`📢 New lead notification sent: ${lead.name}`);
};

// Emit deal update notification
const emitDealUpdate = (deal) => {
  if (!io) return;
  io.to("Admin").to("Sales").emit("deal_update", {
    type: "deal_update",
    message: `Deal updated: ${deal.title} (${deal.dealProbability}% probability)`,
    data: deal,
    timestamp: new Date(),
  });
  console.log(`📢 Deal update notification sent: ${deal.title}`);
};

// Emit critical ticket alert
const emitTicketAlert = (ticket) => {
  if (!io) return;
  const rooms = ["Admin", "Support"];
  if (ticket.priority === "Critical") {
    io.to(rooms[0]).to(rooms[1]).emit("ticket_alert", {
      type: "ticket_alert",
      message: `Critical ticket: ${ticket.title}`,
      data: ticket,
      priority: "critical",
      timestamp: new Date(),
    });
    console.log(`🚨 Critical ticket alert sent: ${ticket.title}`);
  }
};

// Emit AI recommendation
const emitRecommendation = (recommendation, userId = null) => {
  if (!io) return;
  if (userId) {
    // Send to specific user
    io.to(`user_${userId}`).emit("ai_recommendation", {
      type: "ai_recommendation",
      message: recommendation.message,
      data: recommendation,
      timestamp: new Date(),
    });
  } else {
    // Broadcast to all
    io.emit("ai_recommendation", {
      type: "ai_recommendation",
      message: recommendation.message,
      data: recommendation,
      timestamp: new Date(),
    });
  }
  console.log(`🤖 AI recommendation sent`);
};

module.exports = {
  initializeSocket,
  getIO,
  emitNewLead,
  emitDealUpdate,
  emitTicketAlert,
  emitRecommendation,
};
