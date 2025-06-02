const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
} = require("../controllers/cartController");

// Protected routes (authenticated users)
router.get("/", protect, getCart);
router.post("/add", protect, addToCart);
router.put("/update", protect, updateCartItem);
router.delete("/remove/:productId", protect, removeFromCart);

module.exports = router;
