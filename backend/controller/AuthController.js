const bcrypt = require("bcryptjs");
const dayjs = require("dayjs");
const { v4: uuid } = require("uuid");
const OTP = require("../models/Otp");
const { User } = require("../models/userSchema");
const { issueTokens } = require("../utils/jwt");
const { sendMail } = require("../utils/mailer");

function genUsernameFromTarget(target) {
  const base = target.replace(/[^a-z0-9]/ig,"").slice(0,10);
  return base + Math.floor(Math.random()*9000 + 1000);
}

exports.requestOtp = async function (req, res) {
  const { target, channel, context } = req.body;
  if(!target || !channel || !context) return res.status(400).json({ error: "missing" });
    let existingUser = await User.findOne({ $or: [{ email: target }, { phone: target }] });
    if (existingUser && context === "signup") {
        return res.status(400).json({ error: "User already registered , please sign in " });
    }
  // rate-limit check should be added here
  const code = String(Math.floor(100000 + Math.random()*900000));
  const codeHash = await bcrypt.hash(code, 10);
  const otp = await OTP.create({
    _id: uuid(),
    channel, target, codeHash, context,
    expiresAt: dayjs().add(10, "minute").toDate()
  });
  // for dev send via email
  if (channel === "email") {
  try {
    await sendMail(target, "Your QwikPay OTP", `Your OTP is ${code}. It expires in 10 minutes.`);
  } catch (err) {
    console.error("sendMail failed:", err.message);
    // do not throw
  }
}
 else {
    // simulate SMS or log
    console.log("SMS OTP to", target, code);
  }

  return res.json({ ok: true, requestId: otp._id });
};


exports.verifyOtp = async function (req, res) {
  const { target, code, context,userData} = req.body;
  if(!target || !code || !context) return res.status(400).json({ error: "missing" });

  const otp = await OTP.findOne({ target, context }).sort({ createdAt: -1 });
  if(!otp) return res.status(400).json({ error: "not_found" });
  if(otp.consumedAt) return res.status(400).json({ error: "already_used" });
  if(otp.expiresAt < new Date()) return res.status(400).json({ error: "expired" });

  const ok = await bcrypt.compare(String(code), otp.codeHash);
  if(!ok) {
    otp.attempts = (otp.attempts || 0) + 1;
    await otp.save();
    return res.status(400).json({ error: "invalid" });
  }

  otp.consumedAt = new Date();
  await otp.save();
  let user = await User.findOne({ $or: [{ email: target }, { phone: target }] });
  if(!user && context === "signup") {
    const uid = uuid();
    const userName = genUsernameFromTarget(target);
    if (!userName) userName = "user_" + uid;  // guaranteed unique fallback

    console.log(userName);
    user = await User.create({ _id: uid, userName:userName, email: target.includes("@") ? target : undefined, phoneNumber:userData.phoneNumber,firstName:userData.firstName,lastName:userData.lastName });
  }
  if(!user) return res.status(404).json({ error: "user_not_found" });

  const tokens = issueTokens(user._id);
  // optionally set refresh cookie
  res.cookie("refreshToken", tokens.refresh, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/", // ✅ add this
  maxAge: 30 * 24 * 60 * 60 * 1000
});
  res.json({ access: tokens.access, user , refresh:tokens.refresh });
};