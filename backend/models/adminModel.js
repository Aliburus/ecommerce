const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true, // Admin kullanıcı adı benzersiz olmalı
    },
    email: {
      type: String,
      required: true,
      unique: true, // Admin e-posta adresi benzersiz olmalı
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["superadmin", "admin"],
      default: "admin", // Rol bilgisi: admin veya superadmin
    },
    lastLogin: {
      type: Date,
    },
    createdAt: {
      type: Date,
      default: Date.now, // Admin kaydının oluşturulma zamanı
    },
    updatedAt: {
      type: Date,
      default: Date.now, // Admin kaydının son güncellenme zamanı
    },
  },
  { timestamps: true }
);

// Admin modelini oluşturuyoruz
const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
