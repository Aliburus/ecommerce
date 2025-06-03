const User = require("../models/userModel");
const Product = require("../models/productModel");
const Wishlist = require("../models/wishlistModel");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  try {
    const { name, surname, email, password } = req.body;

    if (!name || !surname || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Lütfen tüm alanları doldurun",
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "Bu email adresi zaten kullanımda",
      });
    }

    const user = await User.create({
      name,
      surname,
      email,
      password,
    });

    if (user) {
      const token = generateToken(user._id);

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      return res.status(201).json({
        success: true,
        message: "Kayıt başarılı",
        user: {
          _id: user._id,
          name: user.name,
          surname: user.surname,
          email: user.email,
          isAdmin: user.isAdmin,
        },
      });
    }
  } catch (error) {
    console.error("Kayıt hatası:", error);
    return res.status(500).json({
      success: false,
      message: "Kayıt işlemi sırasında bir hata oluştu",
    });
  }
});

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Error during logout" });
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Check if user is authenticated
// @route   GET /api/users/check-auth
// @access  Public
const checkAuth = asyncHandler(async (req, res) => {
  res.status(200).json({ message: "User is authenticated" });
});

const getById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user", error });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error });
  }
};

// Şifre değiştirme
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mevcut şifre yanlış" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Şifre başarıyla değiştirildi" });
  } catch (error) {
    res.status(500).json({ message: "Şifre değiştirilemedi", error });
  }
};

// Wishlist işlemleri
const getWishlist = asyncHandler(async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
      path: "products.product",
      select: "_id name price images stock",
      model: "Product",
    });

    if (!wishlist) {
      return res.status(200).json([]);
    }

    res.status(200).json(wishlist.products);
  } catch (error) {
    console.error("Wishlist getirme hatası:", error);
    res
      .status(500)
      .json({ message: "Wishlist alınamadı", error: error.message });
  }
});

const addToWishlist = asyncHandler(async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Ürün ID gerekli" });
    }

    // Ürünün var olduğunu kontrol et
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Ürün bulunamadı" });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user._id,
        products: [{ product: productId }],
      });
      return res
        .status(201)
        .json({ message: "Wishlist oluşturuldu ve ürün eklendi" });
    }

    // Ürün zaten wishlist'te mi kontrol et
    const productExists = wishlist.products.some(
      (item) => item.product.toString() === productId
    );

    if (productExists) {
      return res.status(200).json({ message: "Ürün zaten wishlist'te" });
    }

    wishlist.products.push({ product: productId });
    await wishlist.save();

    res.status(200).json({ message: "Ürün wishlist'e eklendi" });
  } catch (error) {
    console.error("Wishlist ekleme hatası:", error);
    res.status(500).json({ message: "Ürün eklenemedi", error: error.message });
  }
});

const removeFromWishlist = asyncHandler(async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Ürün ID gerekli" });
    }

    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist bulunamadı" });
    }

    const initialLength = wishlist.products.length;
    wishlist.products = wishlist.products.filter(
      (item) => item.product.toString() !== productId
    );

    if (wishlist.products.length === initialLength) {
      return res.status(404).json({ message: "Ürün wishlist'te bulunamadı" });
    }

    await wishlist.save();
    res.status(200).json({ message: "Ürün wishlist'ten kaldırıldı" });
  } catch (error) {
    console.error("Wishlist silme hatası:", error);
    res
      .status(500)
      .json({ message: "Ürün kaldırılamadı", error: error.message });
  }
});

const clearWishlist = asyncHandler(async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist bulunamadı" });
    }

    wishlist.products = [];
    await wishlist.save();

    res.status(200).json({ message: "Wishlist temizlendi" });
  } catch (error) {
    console.error("Wishlist temizleme hatası:", error);
    res
      .status(500)
      .json({ message: "Wishlist temizlenemedi", error: error.message });
  }
});

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  checkAuth,
  getById,
  getAllUsers,
  deleteUser,
  changePassword,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
};
