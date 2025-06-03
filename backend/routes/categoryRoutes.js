const express = require("express");
const router = express.Router();
const {
  getCategories,
  createCategory,
  getBestSellingCategories,
} = require("../controllers/categoryController");

router.route("/").get(getCategories).post(createCategory);
router.get("/best-sellers", getBestSellingCategories);

module.exports = router;
