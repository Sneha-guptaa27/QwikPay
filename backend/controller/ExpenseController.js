const { v4: uuid } = require("uuid");
const Expense = require("../models/Expense");
const Attachment = require("../models/Attachment");
const OCRJob = require("../models/OCRjob");
const multer = require("multer");
const upload = multer({ dest: "./uploads/" }); // dev only

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
  res.json(items);
};

// manual create
exports.create = async function (req, res) {
  const body = req.body;
  const exp = await Expense.create({
    _id: uuid(),
    userId: req.user._id,
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

    res.json({ ok: true, jobId: job._id });
  }
];


