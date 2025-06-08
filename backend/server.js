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

dotenv.config();
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

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/user", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/collections", collectionRoutes);
app.use("/api/admin-settings", adminSettingsRoutes);
app.use("/api/hero", heroRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/email-campaigns", emailCampaignRoutes);
app.use("/api/discounts", discountRoutes);

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
