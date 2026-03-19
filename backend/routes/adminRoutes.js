const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const User = require("../models/User");

router.get("/users", protect, authorize("Admin"), async (req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
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
});

router.put("/users/:id", protect, authorize("Admin"), async (req, res, next) => {
  try {
    const { role, isActive } = req.body;
    const updates = {};
    if (role) updates.role = role;
    if (typeof isActive === "boolean") updates.isActive = isActive;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

router.delete("/users/:id", protect, authorize("Admin"), async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "User deactivated", data: user });
  } catch (error) {
    next(error);
  }
});

module.exports = router;