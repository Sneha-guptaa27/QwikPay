const express = require('express');
const mongo = require('mongoose');
const { Account } = require('../db');
const { authMiddleware } = require('../middleware');
const router = express.Router();



router.get("/balance",authMiddleware, async (req, res) => {
    const account = await Account.findOne({ userId: req.userId });
    res.json({ accountBalance: account.accountBalance });
})

async function transfer(req) {
    const session = await mongo.startSession();
    session.startTransaction();
    const { amount, to } = req.body;
    const account = await Account.findOne({ userId: req.userId }).session(session) //from which transaction has started(sender's acc)
    if (!account || account.accountBalance<amount) {
        await session.abortTransaction();
        return res.json({ msg: "insufficient balance" });
    }
    const toAccount = await Account.findOne({ userId: to }).session(session);
    if (!toAccount) {
        await session.abortTransaction();
        return res.json({ msg: "invalid account" });
    }
    await Account.updateOne({ userId: req.userId }, { $inc: { accountBalance: -amount } }).session(session);
    await Account.updateOne({ userId: to }, { $inc: { accountBalance: amount } }).session(session);
    await session.commitTransaction();
}


module.exports=router;