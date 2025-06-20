const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const path = require("path");
const fs = require("fs");
const AdminSettings = require("../models/adminSettingsModel");
const sendEmail = require("../utils/sendEmail");

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getAllProducts = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.page) || 1;
  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: "i",
        },
      }
    : {};

  // Gender filtresi ekle
  const gender = req.query.gender ? { gender: req.query.gender } : {};
  const category = req.query.category ? { category: req.query.category } : {};

  const count = await Product.countDocuments({
    ...keyword,
    ...gender,
    ...category,
  });
  const products = await Product.find({ ...keyword, ...gender, ...category })
    .populate("category", "name")
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    products,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate(
    "category",
    "name"
  );

  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error("Ürün bulunamadı");
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  try {
    const { name, price, description, category, gender, color } = req.body;

    // Kategori kontrolü
    if (!category) {
      return res.status(400).json({ message: "Kategori seçilmedi" });
    }

    // Gender kontrolü
    if (!gender) {
      return res.status(400).json({ message: "Cinsiyet seçilmedi" });
    }

    // Otomatik benzersiz SKU oluştur
    const random = Math.floor(1000 + Math.random() * 9000);
    const sku = `${name?.substring(0, 3)?.toUpperCase() || "PRD"}-${random}`;

    let variants = [];
    if (req.body.variants) {
      try {
        variants = JSON.parse(req.body.variants);
        // Validation: Her varyantta size ve stock zorunlu
        for (const v of variants) {
          if (!v.size || v.stock === undefined || v.stock === "") {
            return res.status(400).json({
              message: "Her varyant için beden ve stok zorunludur.",
            });
          }
        }
        // Her varyantı normalize et
        variants = variants.map((v) => ({
          size: v.size,
          stock: Number(v.stock),
        }));
      } catch (err) {
        return res
          .status(400)
          .json({ message: "Varyantlar hatalı formatta", error: err.message });
      }
    }
    let stock = 0;
    if (req.body.stock) {
      stock = parseInt(req.body.stock) || 0;
    }

    // Dosya kontrolü
    if (!req.files || !req.files.images) {
      return res
        .status(400)
        .json({ message: "Lütfen en az bir resim yükleyin" });
    }

    let images = req.files.images;
    if (!Array.isArray(images)) images = [images];
    if (images.length > 10) {
      return res
        .status(400)
        .json({ message: "En fazla 10 resim yükleyebilirsiniz" });
    }

    // Uploads klasörüne kaydet
    const uploadedImages = [];
    const uploadDir = path.join(__dirname, "../uploads/products");

    // Uploads klasörünü oluştur
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    for (const image of images) {
      try {
        const fileName = `${Date.now()}-${image.name}`;
        const filePath = path.join(uploadDir, fileName);

        // Dosyayı taşı
        await image.mv(filePath);

        uploadedImages.push({
          url: `/uploads/products/${fileName}`,
          isMain: uploadedImages.length === 0, // İlk resim ana resim olsun
        });
      } catch (uploadError) {
        console.error("Resim yükleme hatası:", uploadError);
        return res.status(500).json({
          message: "Resim yüklenirken hata oluştu",
          error: uploadError.message,
        });
      }
    }

    const product = new Product({
      name,
      price,
      description,
      category,
      sku,
      stock,
      gender,
      color,
      images: uploadedImages,
      variants,
    });

    if (variants && Array.isArray(variants)) {
      for (const v of variants) {
        if (!v.size || v.stock === undefined || v.stock === "") {
          return res.status(400).json({
            message: "Her varyant için beden ve stok zorunludur.",
          });
        }
      }
      product.variants = variants.map((v) => ({
        size: v.size,
        stock: Number(v.stock),
      }));
    }

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error("Ürün oluşturma hatası:", error);
    res.status(500).json({
      message: "Ürün eklenemedi",
      error: error.message,
    });
  }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      price,
      description,
      category,
      stock,
      sku,
      gender,
      variants,
      color,
    } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Ürün bulunamadı" });
    }

    product.name = name || product.name;
    product.price = price || product.price;
    product.description = description || product.description;
    product.category = category || product.category;
    product.stock = stock || product.stock;
    product.sku = sku || product.sku;
    product.gender = gender || product.gender;
    product.color = color || product.color;

    // Varyantları işle
    let processedVariants = [];
    if (variants) {
      try {
        processedVariants = JSON.parse(variants);
      } catch (e) {
        return res.status(400).json({ message: "Geçersiz varyant formatı" });
      }
    }

    // Resimleri işle
    let images = product.images || [];
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => ({
        url: file.path.replace(/\\/g, "/"),
      }));
      images = [...images, ...newImages];
    }

    // Ürünü güncelle
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name,
        price,
        description,
        category,
        stock,
        sku,
        gender,
        color,
        variants: processedVariants,
        images,
      },
      { new: true }
    ).populate("category");

    // Kritik stok kontrolü ve mail bildirimi
    if (processedVariants && processedVariants.length > 0) {
      const lowStockVariants = processedVariants.filter(
        (v) => Number(v.stock) < 10
      );
      if (lowStockVariants.length > 0) {
        try {
          const adminSettings = await AdminSettings.findOne();
          if (adminSettings && adminSettings.contactEmail) {
            const variantList = lowStockVariants
              .map((v) => `${v.size}: ${v.stock} adet`)
              .join("\n");
            await sendEmail({
              to: adminSettings.contactEmail,
              subject: `Kritik Stok Uyarısı: ${name}`,
              text: `Aşağıdaki varyantların stoğu kritik seviyede (10'un altında):\n${variantList}`,
            });
          }
        } catch (err) {
          console.error("Kritik stok maili gönderilemedi:", err);
        }
      }
    }

    res.json({
      message: "Ürün başarıyla güncellendi",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Ürün güncellenirken hata:", error);
    res.status(500).json({ message: "Ürün güncellenirken bir hata oluştu" });
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    // Resimleri sil
    if (product.images && product.images.length > 0) {
      for (const image of product.images) {
        const filePath = path.join(__dirname, "..", image.url);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }
    await product.deleteOne();
    res.json({ message: "Ürün silindi" });
  } else {
    res.status(404);
    throw new Error("Ürün bulunamadı");
  }
});

// @desc    Upload product images
// @route   POST /api/products/:id/images
// @access  Private/Admin
const uploadProductImages = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Ürün bulunamadı");
  }

  if (!req.files || !req.files.images) {
    res.status(400);
    throw new Error("Lütfen en az bir resim yükleyin");
  }

  const images = Array.isArray(req.files.images)
    ? req.files.images
    : [req.files.images];

  const uploadedImages = [];
  const uploadDir = path.join(__dirname, "../uploads/products");

  for (const image of images) {
    const fileName = `${Date.now()}-${image.name}`;
    const filePath = path.join(uploadDir, fileName);

    await image.mv(filePath);

    uploadedImages.push({
      url: `/uploads/products/${fileName}`,
      isMain: product.images.length === 0,
    });
  }

  product.images = [...product.images, ...uploadedImages];
  await product.save();

  res.status(200).json(product);
});

// @desc    Delete product image
// @route   DELETE /api/products/:id/images/:imageId
// @access  Private/Admin
const deleteProductImage = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Ürün bulunamadı");
  }

  const image = product.images.find((img) => img.url === req.params.imageId);

  if (!image) {
    res.status(404);
    throw new Error("Resim bulunamadı");
  }

  // Dosyayı sil
  const filePath = path.join(__dirname, "..", image.url);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  // Ürün resimlerinden kaldır
  product.images = product.images.filter(
    (img) => img.url !== req.params.imageId
  );

  // Ana resim silindiyse ilk resmi ana resim yap
  if (image.isMain && product.images.length > 0) {
    product.images[0].isMain = true;
  }

  await product.save();
  res.json(product);
});

// @desc    Get products by category
// @route   GET /api/products/category/:categoryId
// @access  Public
const getProductsByCategory = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.page) || 1;

  const count = await Product.countDocuments({
    category: req.params.categoryId,
  });
  const products = await Product.find({ category: req.params.categoryId })
    .populate("category", "name")
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    products,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

// En çok satılan ürünler
const getBestSellingProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ soldCount: { $gt: 0 } })
    .sort({ soldCount: -1 })
    .limit(20)
    .select("name images price soldCount");
  res.json(products);
});

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  deleteProductImage,
  getProductsByCategory,
  getBestSellingProducts,
};
