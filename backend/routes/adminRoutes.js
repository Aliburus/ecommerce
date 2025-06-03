// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");

// Yeni login route
router.post("/login", adminController.loginAdmin);

// Mevcut protected admin işlemleri…
router.post("/", protect, adminController.addAdmin); // İlk admin ekleme için korumasız
router.put("/:id/password", protect, adminController.changePassword);
router.get("/", protect, adminController.getAllAdmins);
router.get("/:id", protect, adminController.getAdminById);
router.put("/:id", protect, adminController.updateAdmin);
router.delete("/:id", protect, adminController.deleteAdmin);

module.exports = router;
