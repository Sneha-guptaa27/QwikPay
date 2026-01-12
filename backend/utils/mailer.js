// utils/mailer.js
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendMail(to, subject, text) {
  return resend.emails.send({
    from: "QwikPay <onboarding@resend.dev>", // works without domain setup
    to,
    subject,
    text,
  });
}

module.exports = { sendMail };
