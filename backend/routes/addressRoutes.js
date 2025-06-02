const express = require("express");
const router = express.Router();
const addressController = require("../controllers/addressController");
const { protect } = require("../middleware/authMiddleware");

// Protected routes (authenticated users)
router.get("/", protect, addressController.getUserAddresses);
router.post("/", protect, addressController.addAddress);
router.put("/:id", protect, addressController.updateAddress);
router.delete("/:id", protect, addressController.deleteAddress);
router.put("/:id/set-default", protect, addressController.setDefaultAddress);

module.exports = router;
