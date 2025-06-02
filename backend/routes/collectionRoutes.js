const express = require("express");
const router = express.Router();
const {
  createCollection,
  getCollections,
  getCollectionById,
  deleteCollection,
  addProductToCollection,
  updateCollection,
} = require("../controllers/collectionController");
const { protect } = require("../middleware/authMiddleware");

// Sadece admin koleksiyon ekleyebilsin
router.post("/", protect, createCollection);
router.get("/", getCollections);
router.get("/:id", getCollectionById);
router.delete("/:id", protect, deleteCollection);
router.put("/:id", protect, updateCollection);
router.post("/:id/add-product", protect, addProductToCollection);

module.exports = router;
