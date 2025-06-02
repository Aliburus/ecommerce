const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { protect, admin } = require("../middleware/authMiddleware");

// Protected routes (authenticated users)
router.post("/", protect, orderController.createOrder);
router.get("/my-orders", protect, orderController.getMyOrders);
router.get("/:id", protect, orderController.getOrderById);
router.put("/:id/cancel", protect, orderController.cancelOrder);

// Admin routes
router.get("/", protect, admin, orderController.getAllOrders);
router.put("/:id/status", protect, admin, orderController.updateOrderStatus);
router.get("/stats", protect, admin, orderController.getOrderStats);

module.exports = router;
