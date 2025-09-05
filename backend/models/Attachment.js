const mongoose = require("mongoose");
const { Schema } = mongoose;

<<<<<<< Updated upstream
const AttachSchema = new Schema({
  _id: { type: String, required: true },
  userId: { type: String, ref: "User", required: true },
  path: String,
  filename: String,
  mime: String,
  size: Number,
  parsedText: String
}, { timestamps: true });
=======
const ParsedRowSchema = new Schema(
  {
    date: Date,
    description: String,
    debitPaise: Number,     // positive paise if debit present
    creditPaise: Number,    // positive paise if credit present
    amountPaise: Number,    // signed: credit +, debit -
    balancePaise: Number,   // optional if present in sheet
    raw: Schema.Types.Mixed // original row from the sheet
  },
  { _id: false }
);

const AttachSchema = new Schema(
  {
    _id:     { type: String, required: true },      // uuid
    userId:  { type: String, ref: "User", required: true },

    path:     String,
    filename: String,
    mime:     String,
    size:     Number,

    // OCR output (existing)
    parsedText: String,

    // NEW: structured rows from Excel/CSV imports
    parsedRows: [ParsedRowSchema],

    // What kind of file is this?
    format: { type: String, enum: ["image","pdf","excel","csv","other"], default: "other", index: true }
  },
  { timestamps: true }
);

>>>>>>> Stashed changes
module.exports = mongoose.model("Attachment", AttachSchema);
