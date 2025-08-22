const mongoose = require("mongoose");
const { Schema } = mongoose;
const DueSchema = new Schema({
  _id: { type: String, required: true },
  splitId: { type: String, ref: "SplitGroup", index: true },
  debtorId: { type: String, ref: "User", index: true },
  creditorId: { type: String, ref: "User", index: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ["due","requested","settled","cancelled"], default: "due" }
}, { timestamps: true });
module.exports = mongoose.model("Due", DueSchema);