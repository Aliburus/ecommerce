const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { protect, admin } = require("../middleware/authMiddleware");
const Product = require("../models/productModel");
const { getBestSellingProducts } = require("../controllers/productController");

// Tüm ürünleri getir
router.get("/all", async (req, res) => {
  try {
    const products = await Product.find().populate("category", "name");
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Ürünler alınamadı", error });
  }
});

// Public routes
router.get("/best-sellers", getBestSellingProducts);
router.get("/", productController.getAllProducts);
router.get("/category/:categoryId", productController.getProductsByCategory);
router.get("/:id", productController.getProductById);

// Protected routes (admin only)
router.post("/", protect, admin, productController.createProduct);
router.put("/:id", protect, admin, productController.updateProduct);
router.delete("/:id", protect, admin, productController.deleteProduct);
router.post(
  "/:id/images",
  protect,
  admin,
  productController.uploadProductImages
);
router.delete(
  "/:id/images/:imageId",
  protect,
  admin,
  productController.deleteProductImage
);

module.exports = router;
