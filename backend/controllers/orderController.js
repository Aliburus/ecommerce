const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const AdminSettings = require("../models/adminSettingsModel");
const sendMail = require("../utils/sendMail");

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error("Sipariş öğeleri bulunamadı");
  }

  // Calculate total amount and update stock
  let totalAmount = 0;
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      res.status(404);
      throw new Error(`Ürün bulunamadı: ${item.product}`);
    }
    if (product.stock < item.quantity) {
      res.status(400);
      throw new Error(`Yetersiz stok: ${product.name}`);
    }
    totalAmount += product.price * item.quantity;
    product.stock -= item.quantity;
    await product.save();
  }

  const order = new Order({
    user: req.user._id,
    items,
    totalAmount,
    shippingAddress,
    paymentMethod,
  });

  const createdOrder = await order.save();
  try {
    // Bildirim gönder
    const adminSettings = await AdminSettings.findOne();
    if (
      adminSettings &&
      adminSettings.notificationSettings.newOrder &&
      adminSettings.contactEmail
    ) {
      await sendMail(
        adminSettings.contactEmail,
        "Yeni Sipariş",
        "Sistemde yeni bir sipariş oluşturuldu."
      );
    }
  } catch (error) {
    console.error("Bildirim gönderimi hatası:", error);
  }
  res.status(201).json(createdOrder);
});

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate("items.product", "name images price")
    .populate("shippingAddress");
  res.json(orders);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email")
    .populate("items.product", "name images price")
    .populate("shippingAddress");

  if (!order) {
    res.status(404);
    throw new Error("Sipariş bulunamadı");
  }

  // Check if the order belongs to the logged in user or is admin
  if (
    order.user._id.toString() !== req.user._id.toString() &&
    !req.user.isAdmin
  ) {
    res.status(401);
    throw new Error("Bu siparişi görüntüleme yetkiniz yok");
  }

  res.json(order);
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Sipariş bulunamadı");
  }

  order.status = status;
  const updatedOrder = await order.save();
  res.json(updatedOrder);
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Sipariş bulunamadı");
  }

  // Check if the order belongs to the logged in user
  if (order.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Bu siparişi iptal etme yetkiniz yok");
  }

  // Check if order can be cancelled
  if (order.status !== "pending") {
    res.status(400);
    throw new Error("Bu sipariş artık iptal edilemez");
  }

  // Return items to stock
  for (const item of order.items) {
    const product = await Product.findById(item.product);
    if (product) {
      product.stock += item.quantity;
      await product.save();
    }
  }

  order.status = "cancelled";
  const updatedOrder = await order.save();
  res.json(updatedOrder);
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.page) || 1;

  const count = await Order.countDocuments({});
  const orders = await Order.find({})
    .populate("user", "name email")
    .populate("items.product", "name images price")
    .populate("shippingAddress")
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    orders,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

// @desc    Get order statistics
// @route   GET /api/orders/stats
// @access  Private/Admin
const getOrderStats = asyncHandler(async (req, res) => {
  const stats = await Order.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalAmount: { $sum: "$totalAmount" },
      },
    },
  ]);

  const totalOrders = await Order.countDocuments({});
  const totalRevenue = await Order.aggregate([
    {
      $match: {
        status: { $ne: "cancelled" },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$totalAmount" },
      },
    },
  ]);

  res.json({
    stats,
    totalOrders,
    totalRevenue: totalRevenue[0]?.total || 0,
  });
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getAllOrders,
  getOrderStats,
};
