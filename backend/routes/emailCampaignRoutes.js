const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const {
  createCampaign,
  getCampaigns,
  getCampaign,
  sendCampaign,
  getUserCampaigns,
} = require("../controllers/emailCampaignController");

router.post("/", protect, admin, createCampaign);
router.get("/", protect, admin, getCampaigns);
router.get("/user", protect, getUserCampaigns);
router.get("/:id", protect, admin, getCampaign);
router.post("/:id/send", protect, admin, sendCampaign);

module.exports = router;
