const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoiceController");
const { protect, admin } = require("../middleware/authMiddleware");

// Protected routes (authenticated users)
router.get("/my-invoices", protect, invoiceController.getMyInvoices);
router.get("/:id", protect, invoiceController.getInvoiceById);
router.get("/:id/pdf", protect, invoiceController.downloadInvoicePDF);

// Admin routes
router.get("/", protect, admin, invoiceController.getAllInvoices);
router.post(
  "/generate/:orderId",
  protect,
  admin,
  invoiceController.generateInvoice
);
router.put(
  "/:id/status",
  protect,
  admin,
  invoiceController.updateInvoiceStatus
);

module.exports = router;
