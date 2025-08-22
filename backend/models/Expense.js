const mongoose = require("mongoose");
const { Schema } = mongoose;
const ExpenseSchema = new Schema({
  _id: { type: String, required: true },
  userId: { type: String, ref: "User", index: true, required: true },
  source: { type: String, enum: ["tx","upload","manual"], required: true },
  txId: String,
  title: String,
  description: String,
  category: { type: String, index: true },
  payee: String,
  amount: { type: Number, required: true },
  date: { type: Date, index: true, required: true },
  tags: [String],
  attachmentId: String,
  meta: {}
}, { timestamps: true });
module.exports = mongoose.model("Expense", ExpenseSchema);