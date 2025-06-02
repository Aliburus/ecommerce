const mongoose = require("mongoose");

const adminSettingsSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  notificationSettings: {
    newOrder: { type: Boolean, default: true },
    stockAlert: { type: Boolean, default: true },
  },
  storeName: { type: String, default: "LUXE" },
  contactEmail: { type: String, required: true },
});

module.exports = mongoose.model("AdminSettings", adminSettingsSchema);
