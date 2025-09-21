const { v4: uuid } = require("uuid");
const Expense = require("../models/Expense");
const Attachment = require("../models/Attachment");
const OCRJob = require("../models/OCRjob");
const multer = require("multer");
const upload = multer({ dest: "./uploads/" }); // dev only
const { parseXlsx } = require("../utils/xlsImport");
const fs = require("fs");
const path = require("path");  // ← add this

// list with filters
exports.list = async function (req, res) {
  const { from, to, category, payee, min, max } = req.query;
  const q = { userId: req.user._id };
  if(from || to) q.date = {};
  if(from) q.date.$gte = new Date(from);
  if(to) q.date.$lte = new Date(to);
  if(category) q.category = category;
  if(payee) q.payee = new RegExp(payee, "i");
  if(min || max) q.amount = {};
  if(min) q.amount.$gte = Number(min);
  if(max) q.amount.$lte = Number(max);
  const items = await Expense.find(q).sort({ date: -1 }).limit(500);
  res.json(items);``
};

// manual create
exports.create = async function (req, res) {
  const body = req.body;
  const user = req.user;
  console.log(user);
  const exp = await Expense.create({
    _id: uuid(),
    userId: user._id,
    source: "manual",
    title: body.title,
    description: body.description,
    category: body.category,
    payee: body.payee,
    amount: Number(body.amountPaise),
    date: body.date ? new Date(body.date) : new Date(),
    tags: body.tags ? body.tags.split(",").map(t => t.trim()) : []
  });
  res.json(exp);
};

// upload (multipart) -> returns jobId
exports.upload = [
  upload.single("file"),
  async function (req, res) {
    // store attachment record
    const file = req.file;
    const att = await Attachment.create({
      _id: uuid(),
      userId: req.user._id,
      path: file.path,
      filename: file.originalname,
      mime: file.mimetype,
      size: file.size
    });

    const job = await OCRJob.create({
      _id: uuid(),
      userId: req.user._id,
      attachmentId: att._id,
      status: "queued"
    });

    // In prod push to queue (BullMQ/Redis). For demo we can process inline (but async)
    process.nextTick(async ()=> {
      const tesseract = require("tesseract.js");
      try {
        await OCRJob.findByIdAndUpdate(job._id, { status: "processing" });
        const { data: { text } } = await tesseract.recognize(att.path);
        att.parsedText = text;
        await att.save();
        // naive parse: look for "Total" and digits -- replace with better parsing
        const totalMatch = text.match(/total\\s*[:\\-]?\\s*([0-9,.]+)/i) || text.match(/([0-9]+\\.[0-9]{2})/);
        const total = totalMatch ? Math.round(parseFloat(totalMatch[1].replace(/,/g,"")) * 100) : 0;
          const dateMatch = text.match(/(\d{2}\/\d{2}\/\d{4})/);
        const date = dateMatch ? new Date(dateMatch[1].split("/").reverse().join("-")) : new Date();
        const expense = await Expense.create({
          _id: uuid(),
          userId: req.user._id,
          source: "upload",
          title: "OCR Bill",
          description: "Imported by OCR",
          amount: total,
          date,
          attachmentId: att._id
        });
        await OCRJob.findByIdAndUpdate(job._id, { status: "done", result: { expenseId: expense._id }});
      } catch (err) {
        await OCRJob.findByIdAndUpdate(job._id, { status: "failed", error: String(err) });
      }
    });

    res.json({ ok: true, jobId: job._id,attachmentId:att._id});
  }
];

exports.getjob = async function (req, res) {
  const jobId = req.params.jobId;
  const job = await OCRJob.findOne({ _id: jobId, userId: req.user._id });
  if(!job) return res.status(404).json({ error: "not_found" });
  res.json(job);
}

exports.getAttachment = async function (req, res) {
  const attId = req.params.id;
  const att = await Attachment.findOne({ _id: attId, userId: req.user._id });
  if(!att) return res.status(404).json({ error: "not_found" });
  res.json(att,"parsed text",att.parsedText);
};

exports.getAttachmentText = async (req, res) => {
  const att = await Attachment
    .findOne({ _id: req.params.id, userId: req.user._id })
    .select('parsedText')
    .lean();
  if (!att) return res.status(404).json({ error: 'not_found' });
  console.log(att.parsedText);
res.type('text/plain').send(att.parsedText || '');
};

// simple keyword-based categorizer (tune these for your data)
const CATEGORY_RULES = [
  { cat: "GROCERY",   keys: ["grocery","supermarket","dmart","big bazaar","blinkit","zepto"] },
  { cat: "FOOD",      keys: ["zomato","swiggy","restaurant","cafe","dominos"] },
  { cat: "UTILITIES", keys: ["electric","power","gas","water","internet","wifi","broadband"] },
  { cat: "FUEL",      keys: ["fuel","petrol","diesel","hpcl","bpcl","indianoil","ioc"] },
  { cat: "RENT",      keys: ["rent"] },
  { cat: "FEES",      keys: ["fee","charges","charge","surcharge","penalty"] },
  { cat: "TRANSFER",  keys: ["neft","imps","rtgs","upi","transfer","paytm","phonepe","gpay"] },
];
function guessCategory(desc="") {
  const d = desc.toLowerCase();
  for (const r of CATEGORY_RULES) if (r.keys.some(k => d.includes(k))) return r.cat;
  return "OTHER";
}

// POST /expense/attachment/xls  (multipart: file=<.xls|.xlsx|.csv>)
exports.uploadXls = [
  upload.single("file"),
  async function (req, res) {
    try {
      if (!req.file) return res.status(400).json({ error: "file_required" });

      const ext = (path.extname(req.file.originalname) || "").toLowerCase();
      if (![".xls",".xlsx",".csv"].includes(ext)) {
        return res.status(400).json({ error: "unsupported_format" });
      }

      const buffer = fs.readFileSync(req.file.path);
      const { rows, headersDetected } = parseXlsx(buffer);

      const att = await Attachment.create({
        _id: uuid(),
        userId: req.user._id,
        path: req.file.path,
        filename: req.file.originalname,
        mime: req.file.mimetype,
        size: req.file.size,
        format: ext === ".csv" ? "csv" : "excel",
        parsedRows: rows,
        // optional: also keep a joined text for search
        parsedText: rows.map(r =>
          [r.date?.toISOString().slice(0,10), r.description, (r.amountPaise/100).toFixed(2)].join(" | ")
        ).join("\n")
      });

      res.status(201).json({
        ok: true,
        attachmentId: att._id,
        rowsCount: rows.length,
        headersDetected
      });
    } catch (err) {
      console.error("uploadXls error:", err);
      res.status(500).json({ error: "xls_import_failed", message: err.message });
    }
  }
];

// POST /expense/attachment/:id/commit  -> create Expense docs from parsedRows
exports.commitXls = async (req, res) => {
  try {
    const attId = req.params.id;
    const att = await Attachment.findOne({ _id: attId, userId: req.user._id });
    if (!att) return res.status(404).json({ error: "attachment_not_found" });

    // Example: parse rows already extracted and save as expenses
    if (!att.parsedRows || att.parsedRows.length === 0) {
      return res.status(400).json({ error: "no_rows_to_commit" });
    }

    const expenses = await Expense.insertMany(
      att.parsedRows.map(r => ({
        _id: uuid(),
        userId: req.user._id,
        source: "xls",
        title: r.description || "Imported Row",
        description: r.description || "",
        category:guessCategory(r.description) || "Uncategorized",
        payee: r.payee || "",
        amount: r.amountPaise || 0,
        date: r.date ? new Date(r.date) : new Date(),
        attachmentId: att._id,
      }))
    );

    res.json({ ok: true, committed: expenses.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "commit_failed", message: err.message });
  }
};
