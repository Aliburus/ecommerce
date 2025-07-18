const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

exports.register = async (req, res) => {
  try {
    const { name, surname, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email zaten kullanımda" });
    }

    const user = new User({ name, surname, email, password });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "Kayıt başarılı",
      user: {
        id: user._id,
        name: user.name,
        surname: user.surname,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Geçersiz email veya şifre" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Geçersiz email veya şifre" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Giriş başarılı",
      user: {
        id: user._id,
        name: user.name,
        surname: user.surname,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Çıkış başarılı" });
};

// Şifremi Unuttum
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "Bu e-posta ile kayıtlı kullanıcı bulunamadı" });
    }
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 1000 * 60 * 30; // 30 dakika
    await user.save();
    const resetUrl = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/reset-password/${resetToken}`;
    await sendEmail({
      to: user.email,
      subject: "Şifre Sıfırlama",
      text: `Şifrenizi sıfırlamak için aşağıdaki linke tıklayın:\n${resetUrl}\nBu link 30 dakika geçerlidir. Eğer siz talep etmediyseniz bu maili dikkate almayın.`,
    });
    res.json({
      message: "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Şifre sıfırlama isteği başarısız",
      error: error.message,
    });
  }
};

// Şifre Sıfırla
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Geçersiz veya süresi dolmuş token" });
    }
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.json({ message: "Şifre başarıyla sıfırlandı" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Şifre sıfırlama başarısız", error: error.message });
  }
};
