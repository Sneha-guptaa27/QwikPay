const mongoose = require("mongoose");
const { Schema } = mongoose;

const AttachSchema = new Schema({
  _id: { type: String, required: true },
  userId: { type: String, ref: "User", required: true },
  path: String,
  filename: String,
  mime: String,
  size: Number,
  parsedText: String
}, { timestamps: true });
module.exports = mongoose.model("Attachment", AttachSchema);
