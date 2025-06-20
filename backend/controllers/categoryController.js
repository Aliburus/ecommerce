const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({});
  res.json(categories);
});

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const slug = name.toLowerCase().replace(/ /g, "-");

  const category = new Category({
    name,
    slug,
  });

  const createdCategory = await category.save();
  res.status(201).json(createdCategory);
});

// En çok satılan kategoriler
const getBestSellingCategories = asyncHandler(async (req, res) => {
  const result = await Category.find({}).sort({ soldCount: -1 }).limit(5);
  res.json(result);
});

const updateCategory = asyncHandler(async (req, res) => {
  const { name, slug } = req.body;
  const category = await Category.findById(req.params.id);

  if (category) {
    category.name = name || category.name;
    category.slug = slug || category.slug;
    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } else {
    res.status(404);
    throw new Error("Kategori bulunamadı");
  }
});

// Kategori sil
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (category) {
    await category.deleteOne();
    res.json({ message: "Kategori silindi" });
  } else {
    res.status(404);
    throw new Error("Kategori bulunamadı");
  }
});

const getCategoriesWithProducts = asyncHandler(async (req, res) => {
  const categoriesWithProducts = await Product.distinct("category");
  const categories = await Category.find({
    _id: { $in: categoriesWithProducts },
  });
  res.json(categories);
});

module.exports = {
  getCategories,
  createCategory,
  getBestSellingCategories,
  updateCategory,
  deleteCategory,
  getCategoriesWithProducts,
};
