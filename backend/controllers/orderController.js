const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const AdminSettings = require("../models/adminSettingsModel");
const sendMail = require("../utils/sendMail");
const User = require("../models/userModel");
const Category = require("../models/categoryModel");

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
    // Ürün satış adedini artır
    product.soldCount = (product.soldCount || 0) + item.quantity;
    await product.save();
    // Kategori satış adedini artır
    if (product.category) {
      await Category.findByIdAndUpdate(product.category, {
        $inc: { soldCount: item.quantity },
      });
    }
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
  const { status, note } = req.body;

  const order = await Order.findById(req.params.id)
    .populate("user", "email name")
    .lean();

  if (!order) {
    res.status(404);
    throw new Error("Sipariş bulunamadı");
  }

  // Durum geçmişine ekle
  const updatedOrder = await Order.findByIdAndUpdate(
    req.params.id,
    {
      $set: { status },
      $push: {
        statusHistory: {
          status,
          date: new Date(),
          note: note || `${status} durumuna güncellendi`,
        },
      },
    },
    { new: true }
  ).populate("user", "email name");

  // Bildirim gönder
  try {
    const adminSettings = await AdminSettings.findOne().lean();
    if (adminSettings && adminSettings.notificationSettings.newOrder) {
      // Admin'e bildirim
      if (adminSettings.contactEmail) {
        await sendMail(
          adminSettings.contactEmail,
          "Sipariş Durumu Güncellendi",
          `Sipariş #${order._id
            .toString()
            .slice(-6)} durumu "${status}" olarak güncellendi.`
        );
      }
    }

    // Müşteriye bildirim
    if (order.user.email) {
      const statusMessages = {
        processing: "Siparişiniz işleme alındı.",
        shipped: "Siparişiniz kargoya verildi.",
        delivered: "Siparişiniz teslim edildi.",
        cancelled: "Siparişiniz iptal edildi.",
      };

      const message =
        statusMessages[status] || "Sipariş durumunuz güncellendi.";
      await sendMail(
        order.user.email,
        "Sipariş Durumu Güncellendi",
        `Sayın ${order.user.name},\n\n${message}\n\nSipariş No: ${order._id
          .toString()
          .slice(-6)}`
      );
    }
  } catch (error) {
    console.error("Bildirim gönderme hatası:", error);
  }

  res.json(updatedOrder);
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "email name"
  );

  if (!order) {
    res.status(404);
    throw new Error("Sipariş bulunamadı");
  }

  // Check if the order belongs to the logged in user
  if (order.user._id.toString() !== req.user._id.toString()) {
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

  // Durum geçmişine ekle
  order.statusHistory.push({
    status: "cancelled",
    date: new Date(),
    note: "Müşteri tarafından iptal edildi",
  });

  order.status = "cancelled";
  const updatedOrder = await order.save();

  // Bildirim gönder
  try {
    const adminSettings = await AdminSettings.findOne();
    if (adminSettings && adminSettings.notificationSettings.newOrder) {
      // Admin'e bildirim
      if (adminSettings.contactEmail) {
        await sendMail(
          adminSettings.contactEmail,
          "Sipariş İptal Edildi",
          `Sipariş #${order._id.slice(-6)} müşteri tarafından iptal edildi.`
        );
      }
    }

    // Müşteriye bildirim
    if (order.user.email) {
      await sendMail(
        order.user.email,
        "Siparişiniz İptal Edildi",
        `Sayın ${
          order.user.name
        },\n\nSiparişiniz başarıyla iptal edildi.\n\nSipariş No: ${order._id.slice(
          -6
        )}\n\nİptal edilen ürünlerin bedeli en kısa sürede iade edilecektir.`
      );
    }
  } catch (error) {
    console.error("Bildirim gönderme hatası:", error);
  }

  res.json(updatedOrder);
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.page) || 1;
  const { search } = req.query;

  let filter = {};
  let userIds = [];

  if (search) {
    // Sipariş ID (24 karakter) ile tam arama
    if (/^[a-fA-F0-9]{24}$/.test(search)) {
      filter._id = search;
    } else if (/^\d{6}$/.test(search)) {
      // Kısa sipariş no ile tam arama (ObjectId'nin son 6 karakteri tam eşleşme)
      const allOrders = await Order.find({});
      const matched = allOrders.filter(
        (o) => o._id.toString().slice(-6) === search
      );
      userIds = matched.map((o) => o._id);
      filter._id = { $in: userIds };
    } else if (search.includes("@") || search.length > 1) {
      // Email veya isim ile arama (hem tam hem kısmi sipariş no)
      const users = await User.find({
        $or: [
          { email: { $regex: search, $options: "i" } },
          { name: { $regex: search, $options: "i" } },
        ],
      });
      userIds = users.map((u) => u._id);
      if (userIds.length > 0) {
        const allOrders = await Order.find({ user: { $in: userIds } });
        // Eğer sadece mail/isim girildiyse tüm siparişler, mail+numara girildiyse kısmi arama
        const matched = allOrders.filter(
          (o) =>
            o.user &&
            o._id
              .toString()
              .slice(-6)
              .includes(search.replace(/[^0-9a-zA-Z]/g, ""))
        );
        if (
          search.replace(/[^0-9a-zA-Z]/g, "").length > 0 &&
          matched.length > 0
        ) {
          filter._id = { $in: matched.map((o) => o._id) };
          filter.user = { $in: userIds };
        } else {
          filter.user = { $in: userIds };
        }
      } else {
        // Hiç user yoksa boş sonuç
        filter.user = { $in: [] };
      }
    } else {
      // Son 6 hanede search geçen siparişler
      const allOrders = await Order.find({});
      const matched = allOrders.filter((o) =>
        o._id.toString().slice(-6).includes(search)
      );
      userIds = matched.map((o) => o._id);
      filter._id = { $in: userIds };
    }
  }

  const count = await Order.countDocuments(filter);
  const orders = await Order.find(filter)
    .populate("user", "name email")
    .populate({
      path: "items.product",
      select: "name images price",
      options: { lean: true },
    })
    .populate("shippingAddress")
    .lean()
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
