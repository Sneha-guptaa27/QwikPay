const mongoose = require("mongoose");
const { Schema } = mongoose;

const OCRJobSchema = new Schema({
  _id: { type: String, required: true },
  userId: { type: String, ref: "User", required: true },
  attachmentId: { type: String, required: true },
  status: { type: String, enum: ["queued","processing","done","failed"], default: "queued" },
  result: {},
  error: String
}, { timestamps: true });
module.exports = mongoose.model("OCRJob", OCRJobSchema);