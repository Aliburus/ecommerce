const Invoice = require("../models/invoiceModel");
const Order = require("../models/orderModel");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const PDFDocument = require("pdfkit");
const asyncHandler = require("express-async-handler");
const sendEmail = require("../utils/sendEmail");

// @desc    Get user invoices
// @route   GET /api/invoices/my-invoices
// @access  Private
const getMyInvoices = asyncHandler(async (req, res) => {
  const invoices = await Invoice.find({ user: req.user._id })
    .populate("order", "orderNumber status")
    .sort("-createdAt");
  res.json(invoices);
});

// @desc    Get invoice by ID
// @route   GET /api/invoices/:id
// @access  Private
const getInvoiceById = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id)
    .populate("user", "name email")
    .populate("order", "orderNumber status")
    .populate("items.product", "name sku");

  if (!invoice) {
    res.status(404);
    throw new Error("Fatura bulunamadı");
  }

  if (
    invoice.user._id.toString() !== req.user._id.toString() &&
    !req.user.isAdmin
  ) {
    res.status(401);
    throw new Error("Bu faturayı görüntüleme yetkiniz yok");
  }

  res.json(invoice);
});

// @desc    Generate invoice for order
// @route   POST /api/invoices/generate/:orderId
// @access  Private/Admin
const generateInvoice = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId)
    .populate("user", "name email")
    .populate("items.product", "name sku price")
    .populate("shippingAddress");

  if (!order) {
    res.status(404);
    throw new Error("Sipariş bulunamadı");
  }

  // Check if invoice already exists
  const existingInvoice = await Invoice.findOne({ order: order._id });
  if (existingInvoice) {
    res.status(400);
    throw new Error("Bu sipariş için fatura zaten oluşturulmuş");
  }

  // Generate invoice number
  const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // Create invoice
  const invoice = new Invoice({
    order: order._id,
    invoiceNumber,
    user: order.user._id,
    billingAddress: {
      fullName: order.shippingAddress.fullName,
      address: order.shippingAddress.address,
      city: order.shippingAddress.city,
      state: order.shippingAddress.state,
      country: order.shippingAddress.country,
      zipCode: order.shippingAddress.zipCode,
    },
    items: order.items.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      quantity: item.quantity,
      unitPrice: item.product.price,
      taxRate: 18,
      taxAmount: item.product.price * item.quantity * 0.18,
      total: item.product.price * item.quantity * 1.18,
    })),
    subtotal: order.totalAmount,
    taxTotal: order.totalAmount * 0.18,
    shippingCost: 0,
    totalAmount: order.totalAmount * 1.18,
    paymentMethod: order.paymentMethod,
    issueDate: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  // Generate PDF
  const pdfDoc = new PDFDocument();
  const pdfChunks = [];

  pdfDoc.on("data", (chunk) => pdfChunks.push(chunk));
  pdfDoc.on("end", async () => {
    const pdfBuffer = Buffer.concat(pdfChunks);
    invoice.pdfBuffer = pdfBuffer;
    await invoice.save();

    // Send email with PDF attachment
    const emailSubject = `Fatura #${invoiceNumber}`;
    const emailText = `Sayın ${order.user.name},\n\n${invoiceNumber} numaralı faturanız ekte yer almaktadır.\n\nSaygılarımızla,\nLUXE`;

    try {
      await sendEmail({
        to: order.user.email,
        subject: emailSubject,
        text: emailText,
        attachments: [
          {
            filename: `fatura-${invoiceNumber}.pdf`,
            content: pdfBuffer,
          },
        ],
      });
    } catch (error) {
      console.error("Email gönderme hatası:", error);
    }
  });

  // Add content to PDF
  pdfDoc.fontSize(20).text("FATURA", { align: "center" });
  pdfDoc.moveDown();
  pdfDoc.fontSize(12).text(`Fatura No: ${invoiceNumber}`);
  pdfDoc.text(`Tarih: ${new Date().toLocaleDateString()}`);
  pdfDoc.moveDown();

  // Company info
  pdfDoc.text("Firma Bilgileri:");
  pdfDoc.text("Şirket Adı: LUXE");
  pdfDoc.text("Adres: İstanbul, Türkiye");
  pdfDoc.text("Vergi No: 1234567890");
  pdfDoc.moveDown();

  // Customer info
  pdfDoc.text("Müşteri Bilgileri:");
  pdfDoc.text(`Ad Soyad: ${order.shippingAddress.fullName}`);
  pdfDoc.text(`Adres: ${order.shippingAddress.address}`);
  pdfDoc.text(`${order.shippingAddress.city}, ${order.shippingAddress.state}`);
  pdfDoc.text(
    `${order.shippingAddress.country} ${order.shippingAddress.zipCode}`
  );
  pdfDoc.moveDown();

  // Items table
  pdfDoc.text("Ürünler:");
  pdfDoc.moveDown();

  // Table header
  pdfDoc.text("Ürün", 50, pdfDoc.y, { width: 200 });
  pdfDoc.text("Miktar", 250, pdfDoc.y, { width: 50 });
  pdfDoc.text("Birim Fiyat", 300, pdfDoc.y, { width: 100 });
  pdfDoc.text("Toplam", 400, pdfDoc.y, { width: 100 });
  pdfDoc.moveDown();

  // Table rows
  order.items.forEach((item) => {
    pdfDoc.text(item.product.name, 50, pdfDoc.y, { width: 200 });
    pdfDoc.text(item.quantity.toString(), 250, pdfDoc.y, { width: 50 });
    pdfDoc.text(item.product.price.toFixed(2) + " TL", 300, pdfDoc.y, {
      width: 100,
    });
    pdfDoc.text(
      (item.product.price * item.quantity).toFixed(2) + " TL",
      400,
      pdfDoc.y,
      { width: 100 }
    );
    pdfDoc.moveDown();
  });

  // Totals
  pdfDoc.moveDown();
  pdfDoc.text(`Ara Toplam: ${order.totalAmount.toFixed(2)} TL`, {
    align: "right",
  });
  pdfDoc.text(`KDV (%18): ${(order.totalAmount * 0.18).toFixed(2)} TL`, {
    align: "right",
  });
  pdfDoc.text(`Genel Toplam: ${(order.totalAmount * 1.18).toFixed(2)} TL`, {
    align: "right",
  });

  pdfDoc.end();

  res.status(201).json(invoice);
});

// @desc    Download invoice PDF
// @route   GET /api/invoices/:id/pdf
// @access  Private
const downloadInvoicePDF = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);

  if (!invoice) {
    res.status(404);
    throw new Error("Fatura bulunamadı");
  }

  if (
    invoice.user.toString() !== req.user._id.toString() &&
    !req.user.isAdmin
  ) {
    res.status(401);
    throw new Error("Bu faturayı indirme yetkiniz yok");
  }

  if (!invoice.pdfBuffer) {
    res.status(404);
    throw new Error("Fatura PDF'i bulunamadı");
  }

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=fatura-${invoice.invoiceNumber}.pdf`
  );
  res.send(invoice.pdfBuffer);
});

// @desc    Get all invoices
// @route   GET /api/invoices
// @access  Private/Admin
const getAllInvoices = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.page) || 1;

  const count = await Invoice.countDocuments({});
  const invoices = await Invoice.find({})
    .populate("user", "name email")
    .populate("order", "orderNumber status")
    .sort("-createdAt")
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    invoices,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

// @desc    Update invoice status
// @route   PUT /api/invoices/:id/status
// @access  Private/Admin
const updateInvoiceStatus = asyncHandler(async (req, res) => {
  const { paymentStatus } = req.body;

  const invoice = await Invoice.findById(req.params.id);

  if (!invoice) {
    res.status(404);
    throw new Error("Fatura bulunamadı");
  }

  invoice.paymentStatus = paymentStatus;
  const updatedInvoice = await invoice.save();
  res.json(updatedInvoice);
});

module.exports = {
  getMyInvoices,
  getInvoiceById,
  generateInvoice,
  downloadInvoicePDF,
  getAllInvoices,
  updateInvoiceStatus,
};
