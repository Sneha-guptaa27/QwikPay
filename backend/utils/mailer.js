const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT), // 587
  secure: false, // MUST be false for 587
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  connectionTimeout: 10_000,
  greetingTimeout: 10_000,
  socketTimeout: 10_000,
});

async function sendMail(to, subject, text) {
  return transporter.sendMail({
    from: process.env.APP_FROM_EMAIL || "noreply@qwikpay.local",
    to,
    subject,
    text,
  });
}

module.exports = { sendMail };
