const Category = require("../models/categoryModel");
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

module.exports = {
  getCategories,
  createCategory,
};
