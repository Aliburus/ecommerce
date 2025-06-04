const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, text, attachments = [] }) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.MAIL_USER,
    to,
    subject,
    text,
    attachments,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
