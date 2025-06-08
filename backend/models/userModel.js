const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Lütfen isim giriniz"],
    },
    surname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: [true, "Lütfen email giriniz"],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Lütfen geçerli bir email giriniz",
      ],
    },
    password: {
      type: String,
      required: [true, "Lütfen şifre giriniz"],
      minlength: [6, "Şifre en az 6 karakter olmalıdır"],
      select: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    usedDiscounts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Discount",
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
