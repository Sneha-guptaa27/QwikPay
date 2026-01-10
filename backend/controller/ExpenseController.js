// controller/ExpenseController.js
const { v4: uuid } = require("uuid");
const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);

const Expense = require("../models/Expense");
const Attachment = require("../models/Attachment");
const OCRJob = require("../models/OCRjob");

const multer = require("multer");
const upload = multer({ dest: "./uploads/" }); // dev only

const { parseXlsx } = require("../utils/xlsImport");
const fs = require("fs");
const path = require("path");

// ---------------- OCR helpers ----------------
const MONEY_RE = /[₹$€]?\s?\d{1,3}(?:,\d{3})*(?:\.\d{2})?/g;
const toPaise = (s) => {
  const n = parseFloat(String(s).replace(/[^0-9.]/g, ""));
  return isFinite(n) ? Math.round(n * 100) : 0;
};
const noonUTC = (y, m0, d) => new Date(Date.UTC(y, m0, d, 12, 0, 0, 0));
const noonFromDayjs = (dj) => noonUTC(dj.year(), dj.month(), dj.date());

function extractOcrAmount(text) {
  const lines = text.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  const KEY = /(amount\s*due|total\s*due|grand\s*total|invoice\s*total|balance\s*due|total)\b/i;

  // Look from bottom up for a line with a key + number; else take the largest amount
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    if (KEY.test(line)) {
      const nums = line.match(MONEY_RE) || (lines[i + 1]?.match(MONEY_RE) || []);
      if (nums && nums.length) return toPaise(nums[nums.length - 1]);
    }
  }
  const all = text.match(MONEY_RE);
  if (all && all.length) {
    let best = 0;
    for (const s of all) {
      const v = parseFloat(s.replace(/[^0-9.]/g, "")) || 0;
      if (v > best) best = v;
    }
    return Math.round(best * 100);
  }
  return 0;
}

function extractOcrDate(text) {
  const norm = (s) => s.replace(/\bSept\b/gi, "Sep"); // dayjs expects "Sep"
  const FMTS = [
    "YYYY-MM-DD",
    "DD/MM/YYYY",
    "D/M/YYYY",
    "DD/MM/YY",
    "D/M/YY",
    "DD-MM-YYYY",
    "D-M-YYYY",
    "DD.MM.YYYY",
    "DD MMM YYYY",
    "D MMM YYYY",
    "MMM D, YYYY",
    "MMMM D, YYYY",
  ];
  const CANDS = [
    /invoice\s*date[:\-\s]*([A-Za-z0-9 ,\-\/.]+)/i,
    /\bdate[:\-\s]*([A-Za-z0-9 ,\-\/.]+)/i,
  ];

  for (const re of CANDS) {
    const m = text.match(re);
    if (m) {
      const dj = dayjs(norm(m[1]).trim(), FMTS, true);
      if (dj.isValid()) return noonFromDayjs(dj);
    }
  }

  const tokens = text.match(
    /\b\d{4}[\/-]\d{2}[\/-]\d{2}\b|\b\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}\b|\b\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\s+\d{2,4}\b/gi
  );
  if (tokens) {
    for (const s of tokens) {
      const dj = dayjs(norm(s), FMTS, true);
      if (dj.isValid()) return noonFromDayjs(dj);
    }
  }
  return null;
}

// ---------------- list with filters ----------------
exports.list = async function (req, res) {
  try {
    const {
      from,
      to,
      category,
      payee,
      min,
      max,
      page = 1,
      limit = 10,
    } = req.query;

    const q = { userId: req.user._id };

    // 📅 Date filter (transaction date)
    if (from || to) {
      q.date = {};
      if (from) q.date.$gte = new Date(from);
      if (to) q.date.$lte = new Date(to);
    }

    // 🏷 Category filter
    if (category) {
      q.category = category;
    }

    // 👤 Payee search (case-insensitive)
    if (payee) {
      q.payee = new RegExp(payee, "i");
    }

    // 💰 Amount filter (PAISE)
    if (min || max) {
      q.amount = {};
      if (min) q.amount.$gte = Number(min) * 100;
      if (max) q.amount.$lte = Number(max) * 100;
    }

    const pageNum = Math.max(Number(page), 1);
    const limitNum = Math.min(Number(limit), 50);
    const skip = (pageNum - 1) * limitNum;

    // ⚡ Parallel queries (fast)
    const [items, total] = await Promise.all([
      Expense.find(q)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),

      Expense.countDocuments(q),
    ]);

    res.json({
      items,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    console.error("Expense list error:", err);
    res.status(500).json({ error: "server_error" });
  }
};

// ---------------- manual create ----------------
exports.create = async function (req, res) {
  const body = req.body;
  const user = req.user;

  const exp = await Expense.create({
    _id: uuid(),
    userId: user._id,
    source: "manual",
    title: body.title,
    description: body.description,
    category: body.category,
    payee: body.payee,
    amount: Number(body.amountPaise), // paise expected
    date: body.date ? new Date(body.date) : new Date(),
    tags: body.tags ? body.tags.split(",").map((t) => t.trim()) : [],
  });
  res.json(exp);
};

// ---------------- OCR upload (multipart) -> returns jobId ----------------
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
      size: file.size,
    });

    const job = await OCRJob.create({
      _id: uuid(),
      userId: req.user._id,
      attachmentId: att._id,
      status: "queued",
    });

    // In prod push to queue (BullMQ/Redis). For demo we process inline (but async)
    process.nextTick(async () => {
      const tesseract = require("tesseract.js");
      try {
        await OCRJob.findByIdAndUpdate(job._id, { status: "processing" });

        const { data: { text } } = await tesseract.recognize(att.path);
        att.parsedText = text;
        await att.save();

        // -------- robust parse (amount + date) --------
        const normalized = text.replace(/[O]/g, "0"); // small OCR fix
        const total = extractOcrAmount(normalized);   // paise
        let date = extractOcrDate(text);
        if (!date) date = new Date(); // fallback

        // Create expense
        const expense = await Expense.create({
          _id: uuid(),
          userId: req.user._id,
          source: "upload",
          title: "OCR Bill",
          description: "Imported by OCR",
          amount: total,   // paise
          date,            // Date
          attachmentId: att._id,
        });

        await OCRJob.findByIdAndUpdate(job._id, {
          status: "done",
          result: { expenseId: expense._id, amountPaise: total, date },
        });
      } catch (err) {
        await OCRJob.findByIdAndUpdate(job._id, { status: "failed", error: String(err) });
      }
    });

    res.json({ ok: true, jobId: job._id, attachmentId: att._id });
  },
];

exports.getjob = async function (req, res) {
  const jobId = req.params.jobId;
  const job = await OCRJob.findOne({ _id: jobId, userId: req.user._id });
  if (!job) return res.status(404).json({ error: "not_found" });
  res.json(job);
};

exports.getAttachment = async function (req, res) {
  const attId = req.params.id;
  const att = await Attachment.findOne({ _id: attId, userId: req.user._id });
  if (!att) return res.status(404).json({ error: "not_found" });
  res.json({ ...att.toObject(), parsedText: att.parsedText });
};

exports.getAttachmentText = async (req, res) => {
  const att = await Attachment.findOne({ _id: req.params.id, userId: req.user._id })
    .select("parsedText")
    .lean();
  if (!att) return res.status(404).json({ error: "not_found" });
  res.type("text/plain").send(att.parsedText || "");
};

// ---------------- simple keyword-based categorizer ----------------
const CATEGORY_RULES = [
  { cat: "GROCERY",   keys: ["grocery", "supermarket", "dmart", "big bazaar", "blinkit", "zepto"] },
  { cat: "FOOD",      keys: ["zomato", "swiggy", "restaurant", "cafe", "dominos"] },
  { cat: "UTILITIES", keys: ["electric", "power", "gas", "water", "internet", "wifi", "broadband"] },
  { cat: "FUEL",      keys: ["fuel", "petrol", "diesel", "hpcl", "bpcl", "indianoil", "ioc"] },
  { cat: "RENT",      keys: ["rent"] },
  { cat: "FEES",      keys: ["fee", "charges", "charge", "surcharge", "penalty"] },
  { cat: "TRANSFER",  keys: ["neft", "imps", "rtgs", "upi", "transfer", "paytm", "phonepe", "gpay"] },
];
function guessCategory(desc = "") {
  const d = desc.toLowerCase();
  for (const r of CATEGORY_RULES) if (r.keys.some((k) => d.includes(k))) return r.cat;
  return "OTHER";
}

// ---------------- Bank statement upload (XLS/CSV) ----------------
exports.uploadXls = [
  upload.single("file"),
  async function (req, res) {
    try {
      if (!req.file) return res.status(400).json({ error: "file_required" });

      const ext = (path.extname(req.file.originalname) || "").toLowerCase();
      if (![".xls", ".xlsx", ".csv"].includes(ext)) {
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
        parsedText: rows
          .map((r) => [r.date?.toISOString().slice(0, 10), r.description, (r.amountPaise / 100).toFixed(2)].join(" | "))
          .join("\n"),
      });

      res.status(201).json({
        ok: true,
        attachmentId: att._id,
        rowsCount: rows.length,
        headersDetected,
      });
    } catch (err) {
      console.error("uploadXls error:", err);
      res.status(500).json({ error: "xls_import_failed", message: err.message });
    }
  },
];

// ---------------- Commit XLS rows to Expense ----------------
exports.commitXls = async (req, res) => {
  try {
    const attId = req.params.id;
    const att = await Attachment.findOne({ _id: attId, userId: req.user._id });
    if (!att) return res.status(404).json({ error: "attachment_not_found" });

    if (!att.parsedRows || att.parsedRows.length === 0) {
      return res.status(400).json({ error: "no_rows_to_commit" });
    }

    const docs = att.parsedRows
      .map((r) => {
        if (!r.date) return null; // skip rows with no valid date
        return {
          _id: uuid(),
          userId: req.user._id,
          source: "xls",
          title: r.description || "Imported Row",
          description: r.description || "",
          category: guessCategory(r.description) || "Uncategorized",
          payee: r.payee || "",
          amount: r.amountPaise || 0, // paise (credits positive, debits negative)
          date: r.date instanceof Date ? r.date : new Date(r.date),
          attachmentId: att._id,
        };
      })
      .filter(Boolean);

    if (!docs.length) return res.status(400).json({ error: "no_valid_rows" });

    const expenses = await Expense.insertMany(docs);
    res.json({ ok: true, committed: expenses.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "commit_failed", message: err.message });
  }
};

exports.getExpenses = async (req, res) => {
  try {
    const userId = req.user._id;

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Expense.find({ userId })
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Expense.countDocuments({ userId }),
    ]);

    res.json({
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("getExpenses error:", err);
    res.status(500).json({ error: "server_error" });
  }
};
