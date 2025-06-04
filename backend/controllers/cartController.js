const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product"
  );

  if (!cart) {
    cart = new Cart({
      user: req.user._id,
      items: [],
      totalAmount: 0,
    });
    await cart.save();
  }

  res.status(200).json(cart);
});

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
  try {
    const { productId, quantity, size } = req.body;
    const userId = req.user._id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Ürün bulunamadı" });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId && item.size === size
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        quantity,
        price: product.price,
        size: size || null,
      });
    }

    cart.totalAmount = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    await cart.save();

    res.status(200).json({ message: "Ürün sepete eklendi", cart });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Sepete ekleme hatası", error: error.message });
  }
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/update/:itemId
// @access  Private
const updateCartItem = asyncHandler(async (req, res) => {
  try {
    const { productId, quantity, size } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: "Sepet bulunamadı" });
    }

    const item = cart.items.find(
      (item) => item.product.toString() === productId && item.size === size
    );
    if (!item) {
      return res.status(404).json({ message: "Ürün sepette bulunamadı" });
    }

    // Varyant stok kontrolü ve güncelleme
    const product = await Product.findById(productId);
    if (size && Array.isArray(product.variants)) {
      const variantIndex = product.variants.findIndex((v) => v.size === size);
      if (variantIndex === -1) {
        return res.status(400).json({ message: "Seçilen beden bulunamadı" });
      }
      // Stok değişimini hesapla
      const diff = quantity - item.quantity;
      if (product.variants[variantIndex].stock < diff) {
        return res.status(400).json({ message: "Yetersiz stok (beden)" });
      }
      product.variants[variantIndex].stock -= diff;
      await product.save();
    } else if (product.stock < quantity - item.quantity) {
      return res.status(400).json({ message: "Yetersiz stok" });
    } else {
      product.stock -= quantity - item.quantity;
      await product.save();
    }

    item.quantity = quantity;
    cart.totalAmount = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    await cart.save();

    res.status(200).json({ message: "Sepet güncellendi", cart });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Sepet güncelleme hatası", error: error.message });
  }
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:itemId
// @access  Private
const removeFromCart = asyncHandler(async (req, res) => {
  try {
    const { productId } = req.params;
    const { size } = req.query;
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: "Sepet bulunamadı" });
    }

    cart.items = cart.items.filter(
      (item) => !(item.product.toString() === productId && item.size === size)
    );
    cart.totalAmount = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    await cart.save();

    res.status(200).json({ message: "Ürün sepetten kaldırıldı", cart });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Sepetten ürün silme hatası", error: error.message });
  }
});

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error("Sepet bulunamadı");
  }

  cart.items = [];
  cart.totalAmount = 0;
  await cart.save();
  res.json(cart);
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
