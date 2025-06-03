const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const { getHero, updateHero } = require("../controllers/heroController");

router.get("/", getHero);
router.put("/", protect, admin, updateHero);

module.exports = router;
