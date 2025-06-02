const Admin = require("../models/adminModel"); // Admin modelini dahil ediyoruz
const bcrypt = require("bcryptjs"); // Şifreyi güvenli şekilde şifrelemek için bcrypt kullanıyoruz
const jwt = require("jsonwebtoken");
// Admin şifre değiştirme
exports.changePassword = async (req, res) => {
  try {
    const { id } = req.params; // Admin ID'sini alıyoruz
    const { currentPassword, newPassword } = req.body; // Mevcut ve yeni şifreyi alıyoruz

    // Admini ID'ye göre buluyoruz
    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Mevcut şifreyi kontrol ediyoruz
    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Yeni şifreyi şifreliyoruz
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Yeni şifreyi veritabanında güncelliyoruz
    admin.password = hashedPassword;
    await admin.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to change password", error: error.message });
  }
};
// Yeni admin kullanıcı ekleme
exports.addAdmin = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Şifreyi hash'le
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Yeni admin oluştur
    const newAdmin = new Admin({
      username,
      email,
      password: hashedPassword, // artık hash’li saklıyoruz
      role,
    });

    await newAdmin.save();
    res.status(201).json({
      message: "Admin user created successfully",
      admin: {
        _id: newAdmin._id,
        username: newAdmin.username,
        email: newAdmin.email,
        role: newAdmin.role,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create admin", error: error.message });
  }
};

// Admin kullanıcıları listeleme
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find(); // Tüm admin kullanıcılarını alıyoruz
    res.status(200).json(admins);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch admins", error: error.message });
  }
};

// Admin kullanıcıyı güncelleme
exports.updateAdmin = async (req, res) => {
  try {
    const { id } = req.params; // ID parametresini alıyoruz
    const { username, email, password, role } = req.body;

    const updatedAdmin = await Admin.findByIdAndUpdate(
      id,
      { username, email, password, role, updatedAt: Date.now() },
      { new: true } // Güncellenmiş admin bilgisini döndür
    );

    if (!updatedAdmin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res
      .status(200)
      .json({ message: "Admin updated successfully", admin: updatedAdmin });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update admin", error: error.message });
  }
};

// Admin kullanıcıyı silme
exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedAdmin = await Admin.findByIdAndDelete(id);

    if (!deletedAdmin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json({ message: "Admin deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete admin", error: error.message });
  }
};

// Admin kullanıcıyı ID ile arama
exports.getAdminById = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json(admin);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch admin", error: error.message });
  }
};
exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};
