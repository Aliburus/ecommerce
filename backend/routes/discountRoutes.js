const express = require("express");
const router = express.Router();
const {
  getDiscounts,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  validateDiscountCode,
  applyCategoryDiscounts,
} = require("../controllers/discountController");
const { protect, admin } = require("../middleware/authMiddleware");

// Public route for validating discount code - en üstte olmalı
router.post("/validate", protect, validateDiscountCode);

// Admin routes
router
  .route("/")
  .get(protect, admin, getDiscounts)
  .post(protect, admin, createDiscount);

router
  .route("/:id")
  .put(protect, admin, updateDiscount)
  .delete(protect, admin, deleteDiscount);

router.post("/apply-category", protect, applyCategoryDiscounts);

module.exports = router;
