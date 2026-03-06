// ─────────────────────────────────────────────────────────────
//  JWT Authentication Middleware
// ─────────────────────────────────────────────────────────────
const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Protect — verifies JWT token from Authorization header.
 * Attaches req.user on success.
 */
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized — no token" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request (excluding password)
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user || !req.user.isActive) {
      return res.status(401).json({ success: false, message: "User not found or deactivated" });
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Not authorized — invalid token" });
  }
};

module.exports = { protect };