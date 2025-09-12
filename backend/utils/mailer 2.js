// utils/mailer.js
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || "smtp.mailtrap.io",
  port: process.env.MAIL_PORT || 2525,
  auth: {
    user: process.env.MAIL_USER || "user",
    pass: process.env.MAIL_PASS || "pass"
  }
});

async function sendMail(to, subject, text) {
  await transporter.sendMail({
    from: process.env.MAIL_FROM || "noreply@qwikpay.local",
    to, subject, text
  });
}

module.exports = { sendMail };