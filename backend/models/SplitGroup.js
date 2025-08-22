const mongoose = require("mongoose");
const { Schema } = mongoose;

const SplitGroupSchema = new Schema({
  _id: { type: String, required: true },
  creatorId: { type: String, ref: "User", required: true },
  title: String,
  totalAmount: { type: Number, required: true },
  currency: { type: String, default: "INR" },
  splitType: { type: String, enum: ["equal","exact","percentage"], default: "equal" },
  participants: [{ userId: String, shareAmount: Number, paidAmount: { type: Number, default: 0 }, status: { type: String, enum: ["due","paid","partial"], default: "due" } }],
  dueDate: Date,
  linkCode: { type: String, unique: true }
}, { timestamps: true });
module.exports = mongoose.model("SplitGroup", SplitGroupSchema);