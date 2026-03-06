const express = require("express");
const {
  createCustomer, getCustomers, getCustomerById, updateCustomer, deleteCustomer,
} = require("../controllers/customerController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const router = express.Router();

router.use(protect); // All customer routes require auth

router.route("/")
  .get(getCustomers)
  .post(createCustomer);

router.route("/:id")
  .get(getCustomerById)
  .put(updateCustomer)
  .delete(authorize("Admin"), deleteCustomer); // Only Admin can delete

module.exports = router;
