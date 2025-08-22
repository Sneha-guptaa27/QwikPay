const express = require('express');
const router = express.Router();
const zod = require('zod');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;
const { User } = require("../models/userSchema");
const { Account } = require("../models/accountSchema");
const { EmailOtp } = require("../models/Otp");
const { authMiddleware } = require('../Middleware/authmiddleware');

const hash = (s) => crypto.createHash("sha256").update(s).digest("hex");
function getRandomInt(min,max) {
    return Math.floor(Math.random() * (max - min + 1));
}

const signUpbody = zod.object({
    username: zod.string({error:"userName has error"}).email(),
    firstName: zod.string({error:"firstName has error"}),
    lastName: zod.string({error:"lastName has error"}),
    phoneNumber: zod.string({ error: "phoneNumber is invalid" }),
    signupTicket: zod.string() 
});

router.post("/signUp", async (req, res) => {
     try {
    const parsed = signUpbody.safeParse(req.body);
    if (!parsed.success) return res.status(411).json({ msg: "invalid inputs" });

    const { username, firstName, lastName, password, phoneNumber, signupTicket } = parsed.data;

    // 1) verify the signup ticket (must be issued by verify-otp)
    let ticketPayload;
    try {
      ticketPayload = jwt.verify(signupTicket, process.env.JWT_SECRET);
    }
    catch {
      return res.status(401).json({ msg: "Invalid or expired signup ticket" });
    }
    if (ticketPayload.purpose !== "signup" || ticketPayload.username !== username.toLowerCase().trim()) {
      return res.status(401).json({ msg: "Signup ticket does not match email" });
    }


    // 3) create user
    const user = await User.create({
      username,
      firstName,
      lastName,
      phoneNumber,
      lastLoginAt: new Date(),
      loginCount: 1
    });

    // 4) create account
    await Account.create({
      userId: user._id,
      accountBalance: getRandomInt(1, 10000)
    });

    // 5) issue your normal auth token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "2h" });
    res.status(201).json({ msg: "User created successfully", token });
     }
     catch (err) {
    console.error("signUp error:", err);
    res.status(500).json({ msg: "server error" });
  }
});


const signInBody = zod.object({
    username: zod.string().email(),
    otp:zod.string()
})

router.post("/signIn", async function (req, res) {
    const { success } = signInBody.safeParse(req.body);
    if (!success) {
        return res.status(411).json({msg:"invalid inputs"})
    }
    const otpMatch = EmailOtp.findOne({ username });
    if (!otpMatch) {
        return res.status(400).json({ message: "OTP not found, request again" });
    }
    if (otpMatch.expiresAt < new Date()) { await EmailOtp.deleteOne({ _id: rec._id }); return { ok: false, msg: "OTP expired. Request again." }; }
    if (otpMatch.attempts >= maxAttempts) { await EmailOtp.deleteOne({ _id: rec._id }); return { ok: false, msg: "Too many attempts. Request a new OTP." }; }
     if (otpMatch.otpHash !== hash(code)) { otpMatch.attempts += 1; await otpMatch.save(); return { ok: false, msg: "Invalid OTP." }; }
  await EmailOtp.deleteOne({ _id: rec._id }); // single-use
   
    const userId = userExist._id;
    const token = jwt.sign({ userId }, secret);
        res.json({ token: token });
        return;

})

const updateBody = zod.object({
    firstName: zod.string().optional(),
    lastName: zod.string().optional(),
    password:zod.string().optional(),
})

router.put("/update",authMiddleware,async function (req, res) {
    const { success } = updateBody.safeParse(req.body);
    if (!success) {
        return res.status(411).json({ msg: "invalid inputs" });
    }
    await User.updateOne({ _id: req.userId },req.body);
    res.json({ msg: "user details updated" });
})

router.get("/userDetails",async function (req, res) {
    const search = req.query.searchVal || "";
    const users = await User.find({
        $or: [{
            firstName:{"$regex":search}
        },
            {
            lastName:{"$regex":search}//regular expression-regex(enables partial or case sensitive string)
            }]
        
    })
    res.json({
        user: users.map((user) => ({
            userName: user.userName,
            firstName: user.firstName,
            lastName: user.lastName,
            _id:user._id
        })) });
})





module.exports = router;

