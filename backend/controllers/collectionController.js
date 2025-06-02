const Collection = require("../models/collectionModel");

// Yeni koleksiyon oluştur
exports.createCollection = async (req, res) => {
  try {
    const { name, description, image, products } = req.body;
    const collection = new Collection({ name, description, image, products });
    await collection.save();
    res.status(201).json(collection);
  } catch (error) {
    res.status(500).json({ message: "Koleksiyon oluşturulamadı", error });
  }
};

// Tüm koleksiyonları getir
exports.getCollections = async (req, res) => {
  try {
    const collections = await Collection.find();
    res.status(200).json(collections);
  } catch (error) {
    res.status(500).json({ message: "Koleksiyonlar alınamadı", error });
  }
};

// Tek koleksiyonu getir
exports.getCollectionById = async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);
    if (!collection)
      return res.status(404).json({ message: "Koleksiyon bulunamadı" });
    res.status(200).json(collection);
  } catch (error) {
    res.status(500).json({ message: "Koleksiyon alınamadı", error });
  }
};

// Koleksiyonu sil
exports.deleteCollection = async (req, res) => {
  try {
    await Collection.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Koleksiyon silindi" });
  } catch (error) {
    res.status(500).json({ message: "Koleksiyon silinemedi", error });
  }
};

// Koleksiyona ürün ekle
exports.addProductToCollection = async (req, res) => {
  try {
    const { productId } = req.body;
    const collection = await Collection.findById(req.params.id);
    if (!collection)
      return res.status(404).json({ message: "Koleksiyon bulunamadı" });
    if (!collection.products.includes(productId)) {
      collection.products.push(productId);
      await collection.save();
    }
    res.status(200).json(collection);
  } catch (error) {
    res.status(500).json({ message: "Ürün eklenemedi", error });
  }
};

// Koleksiyonu güncelle
exports.updateCollection = async (req, res) => {
  try {
    const { name, description, image, products } = req.body;
    const collection = await Collection.findById(req.params.id);

    if (!collection) {
      return res.status(404).json({ message: "Koleksiyon bulunamadı" });
    }

    collection.name = name || collection.name;
    collection.description = description || collection.description;
    collection.image = image || collection.image;
    collection.products = products || collection.products;

    await collection.save();
    res.status(200).json(collection);
  } catch (error) {
    res.status(500).json({ message: "Koleksiyon güncellenemedi", error });
  }
};
