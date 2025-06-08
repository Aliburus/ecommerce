const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getUserRecommendations,
  addInteraction,
} = require("../controllers/recommendationController");

router.get("/", protect, getUserRecommendations);
router.post("/interaction", protect, addInteraction);

module.exports = router;
