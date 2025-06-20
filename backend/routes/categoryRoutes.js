const express = require("express");
const router = express.Router();
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoriesWithProducts,
  getBestSellingCategories,
} = require("../controllers/categoryController");
const { protect, admin } = require("../middleware/authMiddleware");

router.route("/").get(getCategories).post(protect, admin, createCategory);
router
  .route("/:id")
  .put(protect, admin, updateCategory)
  .delete(protect, admin, deleteCategory);

router.get("/with-products", getCategoriesWithProducts);
router.get("/best-sellers", getBestSellingCategories);

module.exports = router;
