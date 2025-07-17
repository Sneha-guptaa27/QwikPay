const express = require('express');
const router = express.Router();
const zod = require('zod');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;
const { User } = require("../db");
const { authMiddleware } = require('../middleware');

const signUpbody = zod.object({
    username: zod.string({error:"userName has error"}).email(),
    firstName: zod.string({error:"firstName has error"}),
    lastName: zod.string({error:"lastName has error"}),
    password: zod.string({error:"password has error"}),
});

router.post("/signUp", async (req, res)=> {
    const { success } = signUpbody.safeParse(req.body);
    console.log(req.body)
    if (!success) {
        return res.status(411).json({msg:"invalid inputs"})
    }
    const existingUser = await User.findOne({ username: req.body.username });
    if (existingUser) {
        return res.status(411).json({ msg: "email already taken" });
    }
    const user = User.create({
        username: req.body.username,  //request's body names are used here
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        password:req.body.password
    })
    const userId = user._id;
    const token = jwt.sign({ userId }, secret);
    res.json({ msg: "User created successfully", token:token });
})

const signInBody = zod.object({
    username: zod.string().email(),
    password:zod.string()
})

router.post("/signIn", async function (req, res) {
    const { success } = signInBody.safeParse(req.body);
    if (!success) {
        return res.status(411).json({msg:"invalid inputs"})
    }
    const userExist = await User.findOne({ username: req.body.username, password: req.body.password });
    if (userExist) {
    const userId = userExist._id;
    const token = jwt.sign({ userId }, secret);
        res.json({ token: token });
        return;
    }
    res.status(411).json({ msg: "error while signing in" });
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

