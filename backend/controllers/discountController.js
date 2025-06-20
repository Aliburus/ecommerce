const Discount = require("../models/discountModel");
const User = require("../models/userModel");
const sendEmail = require("../utils/sendEmail");
const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");
const mongoose = require("mongoose");

// Tüm indirimleri getir
const getDiscounts = asyncHandler(async (req, res) => {
  const discounts = await Discount.find().sort({ createdAt: -1 });
  res.json(discounts);
});

// Yeni indirim oluştur
const createDiscount = asyncHandler(async (req, res) => {
  const {
    code,
    type,
    value,
    startDate,
    endDate,
    minPurchaseAmount,
    maxDiscountAmount,
    usageLimit,
    description,
    categoryId,
    isActive,
    isCategoryDiscount,
    autoApply,
  } = req.body;

  const discount = await Discount.create({
    code,
    type,
    value,
    startDate,
    endDate,
    minPurchaseAmount,
    maxDiscountAmount,
    usageLimit,
    description,
    createdBy: req.user._id,
    categoryId: categoryId
      ? typeof categoryId === "string"
        ? new mongoose.Types.ObjectId(categoryId)
        : categoryId
      : undefined,
    isActive,
    isCategoryDiscount,
    autoApply,
  });

  // Tüm kullanıcılara mail gönder
  try {
    const users = await User.find({}, "name email");
    const emailPromises = users.map(async (user) => {
      try {
        const discountText =
          type === "percentage" ? `%${value}` : `${value} TL`;
        await sendEmail({
          to: user.email,
          subject: "Yeni İndirim Kuponu!",
          text: `Sayın ${
            user.name
          },\n\nYeni bir indirim kuponu oluşturuldu!\n\nKupon Kodu: ${code}\nİndirim: ${discountText}\nGeçerlilik: ${new Date(
            startDate
          ).toLocaleDateString()} - ${new Date(
            endDate
          ).toLocaleDateString()}\n\n${description || ""}\n\nİyi alışverişler!`,
        });
        return { success: true, email: user.email };
      } catch (error) {
        console.error(`Mail gönderme hatası (${user.email}):`, error);
        return { success: false, email: user.email, error };
      }
    });

    const results = await Promise.all(emailPromises);
    console.log(
      `Toplam ${
        results.filter((r) => r.success).length
      } kullanıcıya mail gönderildi`
    );
  } catch (error) {
    console.error("Toplu mail gönderme hatası:", error);
  }

  res.status(201).json(discount);
});

// İndirim güncelle
const updateDiscount = asyncHandler(async (req, res) => {
  const discount = await Discount.findById(req.params.id);
  if (!discount) {
    res.status(404);
    throw new Error("İndirim bulunamadı");
  }

  const updatedDiscount = await Discount.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(updatedDiscount);
});

// İndirim sil
const deleteDiscount = asyncHandler(async (req, res) => {
  const discount = await Discount.findById(req.params.id);
  if (!discount) {
    res.status(404);
    throw new Error("İndirim bulunamadı");
  }

  await discount.deleteOne();
  res.json({ message: "İndirim silindi" });
});

// İndirim kodu kontrolü
const validateDiscountCode = asyncHandler(async (req, res) => {
  const { code, totalAmount } = req.body;

  const discount = await Discount.findOne({
    code,
    isActive: true,
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() },
  });

  if (!discount) {
    res.status(404);
    throw new Error("Geçersiz indirim kodu");
  }

  // Kullanıcının bu kuponu daha önce kullanıp kullanmadığını kontrol et
  const userUsage = await User.findOne({
    _id: req.user._id,
    usedDiscounts: discount._id,
  });

  if (userUsage) {
    res.status(400);
    throw new Error("Bu kuponu daha önce kullandınız");
  }

  if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
    res.status(400);
    throw new Error("İndirim kodu kullanım limitine ulaştı");
  }

  if (totalAmount < discount.minPurchaseAmount) {
    res.status(400);
    throw new Error(
      `Minimum ${discount.minPurchaseAmount} TL alışveriş yapmalısınız`
    );
  }

  let discountAmount = 0;
  if (discount.type === "percentage") {
    discountAmount = (totalAmount * discount.value) / 100;
    if (discount.maxDiscountAmount) {
      discountAmount = Math.min(discountAmount, discount.maxDiscountAmount);
    }
  } else {
    discountAmount = discount.value;
  }

  // Kuponu kullanıldı olarak işaretle
  await User.findByIdAndUpdate(req.user._id, {
    $push: { usedDiscounts: discount._id },
  });

  // Kuponun kullanım sayısını artır
  await Discount.findByIdAndUpdate(discount._id, {
    $inc: { usedCount: 1 },
  });

  res.json({
    discount,
    discountAmount,
    finalAmount: totalAmount - discountAmount,
  });
});

// Sepetteki ürünlere otomatik kategori indirimi uygula
const applyCategoryDiscounts = asyncHandler(async (req, res) => {
  const { items } = req.body; // items: [{productId, quantity, price}]

  // Aktif kategori indirimlerini bul
  const categoryDiscounts = await Discount.find({
    isActive: true,
    isCategoryDiscount: true,
    autoApply: true,
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() },
  });
  console.log(
    "AKTİF KATEGORİ İNDİRİMLERİ:",
    categoryDiscounts.map((d) => ({
      id: d._id,
      categoryId: d.categoryId,
      isActive: d.isActive,
      autoApply: d.autoApply,
      isCategoryDiscount: d.isCategoryDiscount,
      startDate: d.startDate,
      endDate: d.endDate,
    }))
  );

  let totalDiscount = 0;
  let appliedDiscounts = [];

  // Her ürün için kategori indirimi kontrol et
  for (const item of items) {
    const product = await Product.findById(item.productId);
    console.log(
      "ÜRÜN:",
      product?.name,
      "KATEGORİ:",
      product?.category?.toString?.() || product?.category
    );
    if (!product || !product.category) continue;
    // Sadece ObjectId string karşılaştırması
    const applicableDiscount = categoryDiscounts.find(
      (discount) =>
        discount.categoryId.toString() === product.category.toString()
    );
    if (applicableDiscount) {
      let itemDiscount = 0;
      if (applicableDiscount.type === "percentage") {
        itemDiscount =
          (item.price * item.quantity * applicableDiscount.value) / 100;
        if (applicableDiscount.maxDiscountAmount) {
          itemDiscount = Math.min(
            itemDiscount,
            applicableDiscount.maxDiscountAmount
          );
        }
      } else {
        itemDiscount = applicableDiscount.value * item.quantity;
      }
      totalDiscount += itemDiscount;
      appliedDiscounts.push({
        category: product.category.toString(),
        discount: applicableDiscount,
        amount: itemDiscount,
      });
    }
  }

  res.json({
    totalDiscount,
    appliedDiscounts,
  });
});

// Kullanıcının kullanabileceği indirimleri getir
const getUserDiscounts = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const usedDiscounts = user.usedDiscounts || [];

  // Sadece aktif ve daha önce kullanılmamış indirimleri getir, kategori adını da çek
  const discounts = await Discount.find({
    isActive: true,
    _id: { $nin: usedDiscounts },
  })
    .populate("categoryId", "name")
    .sort({ createdAt: -1 });

  res.json(discounts);
});

// Süresi biten indirimleri pasif yap
const deactivateExpiredDiscounts = asyncHandler(async (req, res) => {
  const now = new Date();
  const result = await Discount.updateMany(
    { endDate: { $lt: now }, isActive: true },
    { $set: { isActive: false } }
  );
  res.json({ message: `Pasif yapılan indirim: ${result.modifiedCount}` });
});

module.exports = {
  getDiscounts,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  validateDiscountCode,
  applyCategoryDiscounts,
  getUserDiscounts,
  deactivateExpiredDiscounts,
};
