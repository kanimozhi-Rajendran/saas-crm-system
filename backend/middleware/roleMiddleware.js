// ─────────────────────────────────────────────────────────────
//  Role-Based Access Control Middleware
// ─────────────────────────────────────────────────────────────

/**
 * authorize(...roles) — factory that returns middleware restricting
 * access to users with one of the given roles.
 *
 * Usage: router.delete("/users/:id", protect, authorize("Admin"), handler)
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(" or ")}. Your role: ${req.user.role}`,
      });
    }
    next();
  };
};

module.exports = { authorize };
