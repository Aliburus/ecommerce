const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware"); // JWT doğrulaması
const {
  getAllUsers,
  getById,
  registerUser,
  deleteUser,
  loginUser,
  getUserProfile,
  changePassword,
  updateUserProfile,
  logoutUser,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkAuth,
  clearWishlist,
} = require("../controllers/userController");

// Auth routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/check-auth", protect, checkAuth);

// Profile routes
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Password route
router.put("/change-password", protect, changePassword);

// Wishlist routes
router
  .route("/wishlist")
  .get(protect, getWishlist)
  .delete(protect, clearWishlist);

router.post("/wishlist/add", protect, addToWishlist);
router.post("/wishlist/remove", protect, removeFromWishlist);

// Admin routes
router.route("/").get(protect, admin, getAllUsers);

router
  .route("/:id")
  .get(protect, admin, getById)
  .delete(protect, admin, deleteUser);

module.exports = router;
