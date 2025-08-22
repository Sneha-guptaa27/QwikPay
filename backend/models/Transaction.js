const mongoose = require("mongoose");
const { Schema } = mongoose;

const TransactionSchema = new Schema({
  _id: { type: String, required: true },
  accountId: { type: String, ref: "Account", index: true, required: true },
  type: { type: String, enum: ["debit","credit"], required: true },
  channel: { type: String, enum: ["internal","upi","card","netbanking","wallet","mock"], default: "internal" },
  counterparty: {
    upiId: String,
    userId: String,
    name: String,
    externalRef: String,
  },
  amount: { type: Number, required: true },
  currency: { type: String, default: "INR" },
  status: { type: String, enum: ["pending","success","failed","reversed"], default: "success" },
  narrative: String,
  idempotencyKey: { type: String, index: true },
  meta: {}
}, { timestamps: true });

module.exports = mongoose.model("Transaction", TransactionSchema);