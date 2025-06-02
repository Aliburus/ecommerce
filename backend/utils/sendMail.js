require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  debug: true,
  logger: true,
});

async function sendMail(to, subject, text) {
  try {
    console.log("Mail gönderme başladı...");
    console.log("MAIL_USER:", "aliburus1905@gmail.com");
    console.log("MAIL_PASS uzunluğu:", "kglxrljoecawblzp".length);
    console.log("ENV USER:", process.env.MAIL_USER);
    console.log("ENV PASS:", process.env.MAIL_PASS);

    const info = await transporter.sendMail({
      from: "aliburus1905@gmail.com",
      to,
      subject,
      text,
    });

    console.log("Mail başarıyla gönderildi:", info.messageId);
    return info;
  } catch (error) {
    console.error("Mail gönderme hatası detayları:", {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
      stack: error.stack,
    });
    throw error;
  }
}

module.exports = sendMail;
