const EmailCampaign = require("../models/emailCampaignModel");
const User = require("../models/userModel");
const sendEmail = require("../utils/sendEmail");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");

// Kampanya oluştur
const createCampaign = asyncHandler(async (req, res) => {
  const { name, subject, content, recipientType } = req.body;

  // Alıcıları belirle
  let recipients = [];
  if (recipientType === "all") {
    recipients = await User.find({}, "_id");
  } else if (recipientType === "active") {
    // Son 30 gün içinde alışveriş yapanlar
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    recipients = await User.find(
      {
        "orders.createdAt": { $gte: thirtyDaysAgo },
      },
      "_id"
    );
  }

  const campaign = await EmailCampaign.create({
    name,
    subject,
    content,
    recipients: recipients.map((r) => r._id),
    createdBy: req.user._id,
  });

  res.status(201).json(campaign);
});

// Kampanyaları listele
const getCampaigns = asyncHandler(async (req, res) => {
  const campaigns = await EmailCampaign.find({ createdBy: req.user._id }).sort({
    createdAt: -1,
  });
  res.json(campaigns);
});

// Kampanya detayı
const getCampaign = asyncHandler(async (req, res) => {
  const campaign = await EmailCampaign.findById(req.params.id).populate(
    "recipients",
    "name email"
  );

  if (!campaign) {
    res.status(404);
    throw new Error("Kampanya bulunamadı");
  }

  res.json(campaign);
});

// Kampanya gönder
const sendCampaign = asyncHandler(async (req, res) => {
  const campaign = await EmailCampaign.findById(req.params.id).populate(
    "recipients",
    "name email"
  );

  if (!campaign) {
    res.status(404);
    throw new Error("Kampanya bulunamadı");
  }

  if (campaign.status !== "draft") {
    res.status(400);
    throw new Error("Bu kampanya zaten gönderilmiş");
  }

  try {
    campaign.status = "sending";
    await campaign.save();

    // Tüm mailleri paralel olarak gönder
    const emailPromises = campaign.recipients.map(async (recipient) => {
      try {
        await sendEmail({
          to: recipient.email,
          subject: campaign.subject,
          text: campaign.content.replace(/{{name}}/g, recipient.name),
        });
        return { success: true, email: recipient.email };
      } catch (error) {
        console.error(`Mail gönderme hatası (${recipient.email}):`, error);
        return { success: false, email: recipient.email, error };
      }
    });

    const results = await Promise.all(emailPromises);

    // Sonuçları işle
    campaign.sentCount = results.filter((r) => r.success).length;
    campaign.failedCount = results.filter((r) => !r.success).length;
    campaign.status = campaign.failedCount === 0 ? "completed" : "failed";
    await campaign.save();

    res.json({
      message: "Kampanya gönderimi tamamlandı",
      sentCount: campaign.sentCount,
      failedCount: campaign.failedCount,
    });
  } catch (error) {
    campaign.status = "failed";
    await campaign.save();
    throw error;
  }
});

// Kullanıcıya gönderilen kampanyalar
const getUserCampaigns = asyncHandler(async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      console.error("getUserCampaigns: Kullanıcı yok veya login değil");
      return res.status(401).json({ message: "Giriş yapmanız gerekli" });
    }
    console.log("getUserCampaigns: user", req.user);
    const userId = new mongoose.Types.ObjectId(req.user._id);
    console.log("getUserCampaigns: userId", userId);
    const campaigns = await EmailCampaign.find({ recipients: userId }).sort({
      createdAt: -1,
    });
    console.log("getUserCampaigns: campaigns", campaigns);
    res.json(campaigns);
  } catch (err) {
    console.error("getUserCampaigns error:", err, err.stack);
    res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
      stack: err.stack,
    });
  }
});

module.exports = {
  createCampaign,
  getCampaigns,
  getCampaign,
  sendCampaign,
  getUserCampaigns,
};
