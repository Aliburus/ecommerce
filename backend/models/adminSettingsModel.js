const mongoose = require("mongoose");

const adminSettingsSchema = new mongoose.Schema({
  notificationSettings: {
    newOrder: { type: Boolean, default: true },
    stockAlert: { type: Boolean, default: true },
  },
  storeName: { type: String, default: "LUXE" },
  contactEmail: { type: String, required: true },
  shippingLimit: { type: Number, default: 500 },
  shippingFee: { type: Number, default: 49.9 },
});

module.exports = mongoose.model("AdminSettings", adminSettingsSchema);
