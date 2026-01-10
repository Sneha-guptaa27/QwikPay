const mongoose = require("mongoose");
const { Schema } = mongoose;

const ExpenseSchema = new Schema(
  {
    _id: { type: String, required: true },

    userId: { type: String, ref: "User", index: true, required: true },

    source: {
      type: String,
      enum: ["tx", "upload", "manual", "xls"],
      required: true,
    },

    txId: String,

    title: String,
    description: String,

    category: { type: String, index: true },

    payee: String,

    // 🔒 Amount stored in PAISE
    // 🔴 ALWAYS NEGATIVE (expense)
    amount: {
      type: Number,
      required: true,
    },

    date: { type: Date, index: true, required: true },

    tags: [String],

    attachmentId: String,

    meta: {},
  },
  { timestamps: true }
);

/**
 * 🔐 PRE-SAVE GUARD
 * Ensures ALL expenses are stored as NEGATIVE paise
 * No matter where they come from (manual / OCR / XLS)
 */
ExpenseSchema.pre("save", function (next) {
  if (this.amount !== undefined && this.amount !== null) {
    this.amount = -Math.abs(Number(this.amount));
  }
  next();
});

module.exports = mongoose.model("Expense", ExpenseSchema);
