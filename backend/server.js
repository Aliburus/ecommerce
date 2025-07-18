require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const connectDB = require("./config/db");
const path = require("path");
const fs = require("fs");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");

// Routes
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");
const cartRoutes = require("./routes/cartRoutes");
const addressRoutes = require("./routes/addressRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const collectionRoutes = require("./routes/collectionRoutes");
const adminSettingsRoutes = require("./routes/adminSettingsRoutes");
const heroRoutes = require("./routes/heroRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const emailCampaignRoutes = require("./routes/emailCampaignRoutes");
const discountRoutes = require("./routes/discountRoutes");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// Route'ları dizi ile tanımlayıp döngüyle ekle
const routes = [
  ["/api/auth", authRoutes],
  ["/api/products", productRoutes],
  ["/api/categories", categoryRoutes],
  ["/api/user", userRoutes],
  ["/api/orders", orderRoutes],
  ["/api/cart", cartRoutes],
  ["/api/addresses", addressRoutes],
  ["/api/invoices", invoiceRoutes],
  ["/api/admins", adminRoutes],
  ["/api/collections", collectionRoutes],
  ["/api/admin-settings", adminSettingsRoutes],
  ["/api/hero", heroRoutes],
  ["/api/recommendations", recommendationRoutes],
  ["/api/email-campaigns", emailCampaignRoutes],
  ["/api/discounts", discountRoutes],
];
routes.forEach(([path, handler]) => app.use(path, handler));

// Static uploads
const uploadsPath = path.join(__dirname, "uploads");
app.use("/uploads", express.static(uploadsPath));

// Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});
