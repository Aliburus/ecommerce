const AdminSettings = require("../models/adminSettingsModel");

// Admin ayarlarını getir
exports.getAdminSettings = async (req, res) => {
  try {
    let settings = await AdminSettings.findOne();
    if (!settings) {
      settings = await AdminSettings.create({
        contactEmail: "info@site.com",
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
    const {
      notificationSettings,
      storeName,
      contactEmail,
      shippingLimit,
      shippingFee,
    } = req.body;
    let settings = await AdminSettings.findOneAndUpdate(
      {},
      {
        $set: {
          notificationSettings,
          storeName,
          contactEmail,
          shippingLimit,
          shippingFee,
        },
      },
      { new: true, upsert: true }
    );
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "Ayarlar güncellenemedi", error });
  }
};
