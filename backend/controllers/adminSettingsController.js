const AdminSettings = require("../models/adminSettingsModel");

// Admin ayarlarını getir
exports.getAdminSettings = async (req, res) => {
  try {
    let settings = await AdminSettings.findOne({ admin: req.user._id });
    if (!settings) {
      settings = await AdminSettings.create({
        admin: req.user._id,
        contactEmail: req.user.email,
      });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "Ayarlar alınamadı", error });
  }
};

// Admin ayarlarını güncelle
exports.updateAdminSettings = async (req, res) => {
  try {
    const { notificationSettings, storeName, contactEmail } = req.body;
    let settings = await AdminSettings.findOneAndUpdate(
      { admin: req.user._id },
      { $set: { notificationSettings, storeName, contactEmail } },
      { new: true, upsert: true }
    );
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "Ayarlar güncellenemedi", error });
  }
};
