const mongoose = require("mongoose");
const { v4: uuid } = require("uuid");
const Account = require("../models/accountSchema");
const Transaction = require("../models/Transaction");

async function internalTransfer({ fromId, toUpiId, amountPaise, note, idempotencyKey }) {
  // atomic with session
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // idempotency check
    if(idempotencyKey) {
      const existing = await Transaction.findOne({ idempotencyKey }).session(session);
      if(existing) {
        await session.commitTransaction();
        return { ok: true, duplicate: true, txId: existing._id };
      }
    }

    const from = await Account.findById(fromId).session(session);
    const to = await Account.findOne({ upiId: toUpiId }).session(session);
    if(!from) throw new Error("from_not_found");
    if(!to) throw new Error("to_not_found");
    if(from.currentBalance < amountPaise) throw new Error("insufficient_balance");
    from.currentBalance -= amountPaise;
    to.currentBalance += amountPaise;
    console.log(from.currentBalance)
    console.log(to.currentBalance)
    await from.save({ session });
    await to.save({ session });

    const txDebitId = uuid();
    const txCreditId = uuid();

    await Transaction.create([{
      _id: txDebitId,
      accountId: from._id,
      type: "debit",
      channel: "internal",
      counterparty: { upiId: to.upiId, userId: to.userId },
      amount: amountPaise,
      narrative: note,
      idempotencyKey
    },{
      _id: txCreditId,
      accountId: to._id,
      type: "credit",
      channel: "internal",
      counterparty: { upiId: from.upiId, userId: from.userId },
      amount: amountPaise,
      narrative: note,
      idempotencyKey
    }], { session, ordered: true });

    await session.commitTransaction();
    return { ok: true, txIds: [txDebitId, txCreditId] };
  } catch (e) {
    await session.abortTransaction();
    throw e;
  } finally {
    session.endSession();
  }
}

exports.transfer = async function (req, res) {
  const { fromAccountId, toUpiId, amountPaise, note } = req.body;
  const idempotencyKey = req.headers["idempotency-key"] || null;
  try {
    const result = await internalTransfer({ fromId: fromAccountId, toUpiId,amountPaise, note, idempotencyKey });
    return res.json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};

// external payment (mock)
exports.externalPayment = async function (req, res) {
  const { fromAccountId, method, payee, amountPaise, note } = req.body;
  const idempotencyKey = req.headers["idempotency-key"] || null;
  // do idempotency check
  if(idempotencyKey) {
    const existing = await Transaction.findOne({ idempotencyKey });
    if(existing) return res.json({ ok: true, duplicate: true, txId: existing._id });
  }
  const from = await Account.findById(fromAccountId);
  if(!from) return res.status(400).json({ error: "from_not_found" });
  if(from.currentBalance < amountPaise) return res.status(400).json({ error: "insufficient" });

  // mock provider call -> success
  const providerRef = `MOCK-${uuid()}`;

  from.currentBalance -= amountPaise;
  await from.save();

  const tx = await Transaction.create({
    _id: uuid(),
    accountId: from._id,
    type: "debit",
    channel: method || "mock",
    counterparty: { name: payee, externalRef: providerRef },
    amount: amountPaise,
    narrative: note,
    idempotencyKey
  });

  return res.json({ ok: true, txId: tx._id, providerRef });
};

//payment History 
exports.paymentHistory = async function (req, res) {
  try {
    const accountId = req.query.accountId || req.params.accountId;
    if (!accountId) {
      return res.status(400).json({ error: "accountId required" });
    }
    const txns = await Transaction
      .find({ accountId }).sort({ createdAt: -1 });

    return res.json({ ok: true, transactions: txns });

  }
  catch(error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
    }
  
}
