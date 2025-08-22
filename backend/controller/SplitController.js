const { v4: uuid } = require("uuid");
const SplitGroup = require("../models/SplitGroup");
const Due = require("../models/Due");
const DueModel = require("../models/Due");
const Account = require("../models/accountSchema");
const paymentService = require("./PaymentController"); // reuse internalTransfer

exports.createSplit = async function (req, res) {
  const { title, totalAmountPaise, splitType, participants, dueDate } = req.body;
  // participants: [{ userId, shareAmountPaise }]
  const split = await SplitGroup.create({
    _id: uuid(),
    creatorId: req.user._id,
    title,
    totalAmount: Number(totalAmountPaise),
    splitType,
    participants,
    dueDate: dueDate ? new Date(dueDate) : undefined,
    linkCode: Math.random().toString(36).slice(2,10)
  });

  const dues = participants
    .filter(p => p.userId !== req.user._id)
    .map(p => ({ _id: uuid(), splitId: split._id, debtorId: p.userId, creditorId: req.user._id, amount: p.shareAmountPaise || p.shareAmount }));
  await Due.insertMany(dues);
  // TODO: send notifications
  res.json({ split, dues });
};

exports.payDue = async function (req, res) {
  const dueId = req.params.id;
  const due = await Due.findById(dueId);
  if(!due) return res.status(404).json({ error: "not_found" });
  if(due.debtorId !== req.user._id) return res.status(403).json({ error: "not_allowed" });

  const debtorAcc = await Account.findOne({ userId: due.debtorId, isPrimary: true });
  const creditorAcc = await Account.findOne({ userId: due.creditorId, isPrimary: true });

  if(!debtorAcc || !creditorAcc) return res.status(400).json({ error: "accounts_missing" });

  try {
    const result = await paymentService.internalTransfer({
      fromId: debtorAcc._id,
      toUpiId: creditorAcc.upiId,
      amountPaise: due.amount,
      note: `Split payment for split ${due.splitId}`,
      idempotencyKey: req.headers["idempotency-key"] || uuid()
    });
    due.status = "settled";
    await due.save();
    res.json({ ok: true, result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
