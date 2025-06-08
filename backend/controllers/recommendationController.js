const Recommendation = require("../models/recommendationModel");
const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");

// Kullanıcı için önerileri getir
const getUserRecommendations = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // 1. Kullanıcının geçmiş etkileşimlerini al
  const userInteractions = await Recommendation.find({ user: userId })
    .populate("product")
    .sort({ createdAt: -1 });

  if (userInteractions.length === 0) {
    // Kullanıcının etkileşimi yoksa en çok satan ürünleri öner
    const bestSellingProducts = await Product.find()
      .sort({ soldCount: -1 })
      .limit(10);
    return res.json(bestSellingProducts);
  }

  // 2. Kategori bazlı etkileşimleri analiz et
  const categoryInteractions = {};
  userInteractions.forEach((interaction) => {
    const categoryId = interaction.product.category.toString();
    if (!categoryInteractions[categoryId]) {
      categoryInteractions[categoryId] = {
        count: 0,
        types: {
          cart: 0,
          wishlist: 0,
          purchase: 0,
        },
      };
    }
    categoryInteractions[categoryId].count++;
    categoryInteractions[categoryId].types[interaction.type]++;
  });

  // 3. Kategorileri önem sırasına göre sırala
  const sortedCategories = Object.entries(categoryInteractions)
    .sort((a, b) => {
      // Önce satın alma sayısına göre
      const purchaseDiff = b[1].types.purchase - a[1].types.purchase;
      if (purchaseDiff !== 0) return purchaseDiff;

      // Sonra wishlist sayısına göre
      const wishlistDiff = b[1].types.wishlist - a[1].types.wishlist;
      if (wishlistDiff !== 0) return wishlistDiff;

      // Son olarak sepet sayısına göre
      return b[1].types.cart - a[1].types.cart;
    })
    .map(([categoryId]) => categoryId);

  // 4. Her kategoriden kaç ürün önerileceğini hesapla
  const categoryLimits = {};
  const totalCategories = sortedCategories.length;
  const productsPerCategory = Math.ceil(10 / totalCategories);

  sortedCategories.forEach((categoryId, index) => {
    // İlk kategorilere daha fazla ürün ver
    const limit = index < 3 ? productsPerCategory + 1 : productsPerCategory;
    categoryLimits[categoryId] = limit;
  });

  // 5. Her kategoriden ürünleri al
  let recommendedProducts = [];
  for (const categoryId of sortedCategories) {
    const limit = categoryLimits[categoryId];
    const products = await Product.find({
      category: categoryId,
      _id: { $nin: userInteractions.map((i) => i.product._id) },
    })
      .sort({ soldCount: -1 })
      .limit(limit);

    recommendedProducts = [...recommendedProducts, ...products];
  }

  // 6. Eğer yeterli ürün yoksa, en çok satan ürünlerden ekle
  if (recommendedProducts.length < 10) {
    const remainingCount = 10 - recommendedProducts.length;
    const additionalProducts = await Product.find({
      _id: {
        $nin: [
          ...userInteractions.map((i) => i.product._id),
          ...recommendedProducts.map((p) => p._id),
        ],
      },
    })
      .sort({ soldCount: -1 })
      .limit(remainingCount);

    recommendedProducts = [...recommendedProducts, ...additionalProducts];
  }

  res.json(recommendedProducts);
});

// Yeni etkileşim ekle
const addInteraction = asyncHandler(async (req, res) => {
  const { productId, type } = req.body;
  const userId = req.user._id;

  const interaction = await Recommendation.create({
    user: userId,
    product: productId,
    type,
  });

  res.status(201).json(interaction);
});

module.exports = {
  getUserRecommendations,
  addInteraction,
};
