// ─────────────────────────────────────────────────────────────
//  Admin Routes — User Management
// ─────────────────────────────────────────────────────────────
const express = require("express");
const { getAllUsers, updateUser, deleteUser } = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(protect);
router.use(authorize("Admin"));

router.get("/users", getAllUsers);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

module.exports = router;
