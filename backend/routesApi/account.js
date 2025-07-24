const express = require('express');
const mongo = require('mongoose');
const { Account } = require('../db');
const { authMiddleware } = require('../middleware');
const router = express.Router();

router.get("/balance",authMiddleware, async (req, res) => {
    const account = await Account.findOne({ userId: req.userId });
    res.json({ accountBalance: account.accountBalance });
})
router.post("/transferAmount",authMiddleware, async (req, res)=>{
    const session = await mongo.startSession();
    session.startTransaction();
    const { amount, to } = req.body;
    const account = await Account.findOne({ userId: req.userId }).session(session) //from which transaction has started(sender's acc)
    if (!account || account.accountBalance<amount) {
        await session.abortTransaction();
        return res.status(400).json({ msg: "insufficient balance" });
    }
    const toAccount = await Account.findOne({ userId: to }).session(session);
    if (!toAccount) {
        await session.abortTransaction();
        return res.status(400).json({ msg: "invalid account" });
    }
    await Account.updateOne({ userId: req.userId }, { $inc: { accountBalance: -amount } }).session(session);
    await Account.updateOne({ userId: to }, { $inc: { accountBalance: amount } }).session(session);
    await session.commitTransaction();
    res.json({msg:"Transaction Successful"})
})

module.exports=router;