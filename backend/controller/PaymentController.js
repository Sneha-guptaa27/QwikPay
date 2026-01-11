const mongoose = require("mongoose");
const { v4: uuid } = require("uuid");
const crypto = require("crypto");
const Razorpay = require("razorpay");

const Account = require("../models/accountSchema");
const Transaction = require("../models/Transaction");

// ---------- Razorpay Client ----------

// fail fast if keys are missing
if (!process.env.RAZORPAY_KEY || !process.env.RAZORPAY_SECRET) {
  throw new Error("Missing RAZORPAY_KEY / RAZORPAY_SECRET in env");
}
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET,
});

// ---------- INTERNAL TRANSFER (unchanged) ----------
async function internalTransfer({ fromId, toUpiId, amountPaise, note, idempotencyKey }) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    if (idempotencyKey) {
      const existing = await Transaction.findOne({ idempotencyKey }).session(session);
      if (existing) {
        await session.commitTransaction();
        return { ok: true, duplicate: true, txId: existing._id };
      }
    }

    const from = await Account.findById(fromId).session(session);
    const to = await Account.findOne({ upiId: toUpiId }).session(session);
    if (!from) throw new Error("from_not_found");
    if (!to) throw new Error("to_not_found");
    if (from.currentBalance < amountPaise) throw new Error("insufficient_balance");

    from.currentBalance -= (amountPaise);
    to.currentBalance += (amountPaise);
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
    }, {
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
    const result = await internalTransfer({ fromId: fromAccountId, toUpiId, amountPaise, note, idempotencyKey });
    return res.json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};

// ---------- EXTERNAL PAYMENTS VIA RAZORPAY ----------
// 1) Create an order (client will open Razorpay Checkout with this)
exports.createExternalOrder = async function (req, res) {
  try {
    const { fromAccountId, amountPaise, note, payee } = req.body;

    // Basic checks
    const from = await Account.findById(fromAccountId);
    if (!from) return res.status(400).json({ error: "from_not_found" });
    if (!Number.isFinite(Number(amountPaise)) || amountPaise <= 0) {
      return res.status(400).json({ error: "invalid_amount" });
    }
    if (from.currentBalance < amountPaise) {
      // We check balance up-front so you can show “insufficient funds” before opening Checkout
      return res.status(400).json({ error: "insufficient_balance" });
    }

    // Create Razorpay Order (amount in paise; INR)
    const receipt = `qw_${Date.now()}`;                 // e.g., "qw_1727639876543"  (<= 40)
    console.log(receipt);
    const order = await razorpay.orders.create({
      amount: Number(amountPaise),
      currency: "INR",
      receipt,
      notes: { payee: payee || "", note: note || "" },
    });

    // Send order + key to client to launch Checkout
    return res.json({
      ok: true,
      keyId: process.env.RAZORPAY_KEY,
      order, // contains id, amount, currency
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "rzp_order_failed" });
  }
};

// 2) Verify signature after client success, then deduct balance & record Transaction
exports.verifyExternalPayment = async function (req, res) {
  try {
    const { fromAccountId, payee, note, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const idempotencyKey = razorpay_payment_id || null;

    // Verify HMAC signature: sha256(order_id + "|" + payment_id, RZP_KEY_SECRET)
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET || "")
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return res.status(400).json({ error: "signature_mismatch" });
    }

    // Idempotency: if we already created a tx for this payment, return it
    if (idempotencyKey) {
      const existing = await Transaction.findOne({ idempotencyKey });
      if (existing) {
        return res.json({ ok: true, duplicate: true, txId: existing._id, providerRef: razorpay_payment_id });
      }
    }

    // Fetch order to get the final authorized amount
    const order = await razorpay.orders.fetch(razorpay_order_id);
    const amountPaise = Number(order.amount); // amount is in paise

    // Deduct from balance & record transaction atomically
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const from = await Account.findById(fromAccountId).session(session);
      if (!from) throw new Error("from_not_found");
      if (from.currentBalance < amountPaise) throw new Error("insufficient_balance"); // re-check

      from.currentBalance -= (amountPaise / 100);
      await from.save({ session });

      const tx = await Transaction.create([{
        _id: uuid(),
        accountId: from._id,
        type: "debit",
        channel: "razorpay",
        counterparty: { name: payee || "External Payee", externalRef: razorpay_payment_id, orderId: razorpay_order_id },
        amount: amountPaise,
        narrative: note,
        idempotencyKey
      }], { session, ordered: true });

      await session.commitTransaction();
      return res.json({ ok: true, txId: tx[0]._id, providerRef: razorpay_payment_id });
    } catch (e) {
      await session.abortTransaction();
      throw e;
    } finally {
      session.endSession();
    }
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: err.message || "verification_failed" });
  }
};


// ---------- PAYMENT HISTORY (unchanged) ----------
exports.paymentHistory = async function (req, res) {
  try {
    const accountId = req.query.accountId || req.params.accountId;
    if (!accountId) {
      return res.status(400).json({ error: "accountId required" });
    }
    const txns = await Transaction
      .find({ accountId })
      .sort({ createdAt: -1 });

    return res.json({ ok: true, transactions: txns });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};
