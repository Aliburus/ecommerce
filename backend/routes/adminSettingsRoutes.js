const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const adminSettingsController = require("../controllers/adminSettingsController");
const sendMail = require("../utils/sendMail");

router.post("/test-mail", protect, admin, async (req, res) => {
  try {
    const { to, subject, text } = req.body;
    await sendMail(to, subject, text);
    res.json({ message: "Test maili gönderildi" });
  } catch (error) {
    res.status(500).json({ message: "Mail gönderilemedi", error });
  }
});
router.get("/", protect, admin, adminSettingsController.getAdminSettings);
router.put("/", protect, admin, adminSettingsController.updateAdminSettings);

module.exports = router;
