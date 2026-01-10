const { default: mongoose } = require('mongoose');
const { Schema } = mongoose;

const AccountSchema = new Schema({
  _id: { type: String, required: true },
  userId: { type: String, ref: "User", index: true, required: true },
  holderName: String,
  bankName: String,
  accountNumber: { type: String, required: true },
  ifsc: { type: String, required: true },
  pan: { type: String, required: true },
  upiId: { type: String, unique: true, required: true },
  currentBalance: { type: Number, default: 0 }, // paise
  expenseBudget: { type: Number, default: 5000 }, // paise
  isPrimary: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Account", AccountSchema);