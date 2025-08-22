const { default: mongoose } = require("mongoose");
const { Schema } = mongoose;

const OTPSchema = new Schema({
  _id: { type: String, required: true },
  channel: { type: String, enum: ["email","phone"], required: true },
  target: { type: String, required: true },
  codeHash: { type: String, required: true },
  context: { type: String, enum: ["signup","login"], required: true },
  expiresAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 },
  consumedAt: Date
}, { timestamps: true });

module.exports = mongoose.model("OTP", OTPSchema);
