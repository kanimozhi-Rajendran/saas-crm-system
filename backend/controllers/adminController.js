// ─────────────────────────────────────────────────────────────
//  Admin Controller — User Management
// ─────────────────────────────────────────────────────────────
const User = require("../models/User");
const { logActivity } = require("../utils/activityLogger");

// ── @route  GET /api/admin/users ──────────────────────────────
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    // Count by role
    const roleCount = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      count: users.length,
      roleCount: roleCount.reduce((acc, r) => {
        acc[r._id] = r.count;
        return acc;
      }, {}),
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// ── @route  PUT /api/admin/users/:id ──────────────────────────
const updateUser = async (req, res, next) => {
  try {
    const { role, isActive } = req.body;
    const updates = {};

    if (role) updates.role = role;
    if (typeof isActive === "boolean") updates.isActive = isActive;

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await logActivity("User", user._id, "updated", `User ${user.name} updated by admin`, req.user._id, updates);

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// ── @route  DELETE /api/admin/users/:id ───────────────────────
const deleteUser = async (req, res, next) => {
  try {
    // Soft delete - just deactivate
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await logActivity("User", user._id, "deleted", `User ${user.name} deactivated`, req.user._id);

    res.json({ success: true, message: "User deactivated", data: user });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, updateUser, deleteUser };
