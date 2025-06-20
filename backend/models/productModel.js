const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    color: {
      type: String,
      required: false,
    },
    gender: {
      type: String,
      enum: ["Kadın", "Erkek", "Unisex"],
      required: true,
    },
    images: [
      {
        url: String,
        public_id: String,
        isMain: {
          type: Boolean,
          default: false,
        },
      },
    ],
    specifications: {
      type: Map,
      of: String,
    },
    stock: {
      type: Number,
      required: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
    },
    variants: [
      {
        size: String,
        stock: Number,
      },
    ],
    discount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    soldCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
