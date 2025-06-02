const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    billingAddress: {
      fullName: String,
      address: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
      taxNumber: String,
      companyName: String,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        name: String,
        quantity: Number,
        unitPrice: Number,
        taxRate: Number,
        taxAmount: Number,
        total: Number,
      },
    ],
    subtotal: Number,
    taxTotal: Number,
    shippingCost: Number,
    totalAmount: Number,
    paymentMethod: String,
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "cancelled"],
      default: "pending",
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: Date,
    notes: String,
    pdfUrl: String,
  },
  { timestamps: true }
);

const Invoice = mongoose.model("Invoice", invoiceSchema);

module.exports = Invoice;
