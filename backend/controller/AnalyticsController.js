const Expense = require("../models/Expense");
const TZ = "Asia/Kolkata";

// build user/date matcher
function buildMatch(userId, from, to) {
  const m = { userId, date: { $type: "date" } };
  if (from || to) {
    m.date = {};
    if (from) m.date.$gte = new Date(from);
    if (to)   m.date.$lte = new Date(to);
  }
  return m;
}

// ---------- PIE: NET spend by category (credits reduce spend) ----------
exports.byCategory = async (req, res) => {
  try {
    const { from, to } = req.query;
    const userId = req.user._id;
    const match = buildMatch(userId, from, to);

    const rows = await Expense.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $ifNull: ["$category", "UNCATEGORIZED"] },
          netPaise: { $sum: "$amount" } // debits negative, credits positive
        }
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          // spend = max(0, -net)
          totalPaise: {
            $cond: [{ $lt: ["$netPaise", 0] }, { $multiply: ["$netPaise", -1] }, 0]
          }
        }
      },
      { $sort: { totalPaise: -1 } }
    ]);

    res.json(rows.map(r => ({
      category: r.category,
      total: Math.round(r.totalPaise) / 100
    })));
  } catch (e) {
    console.error("byCategory error:", e);
    res.status(500).json({ error: "server_error" });
  }
};

// ---------- BAR: NET spend per month (IST), cap to latest txn if no range ----------
exports.byMonth = async (req, res) => {
  try {
    const { from, to } = req.query;
    const userId = req.user._id;

    const match = buildMatch(userId, from, to);

    // If no explicit range, cap to latest real txn date (debit or credit)
    if (!from && !to) {
      const [mx] = await Expense.aggregate([
        { $match: { userId, date: { $type: "date" } } },
        { $group: { _id: null, maxDate: { $max: "$date" } } }
      ]);
      if (mx?.maxDate) {
        match.date = match.date || {};
        match.date.$lte = mx.maxDate;
      }
    }

    const rows = await Expense.aggregate([
      { $match: match },
      { $addFields: { mstart: { $dateTrunc: { date: "$date", unit: "month", timezone: TZ } } } },
      { $group: { _id: "$mstart", netPaise: { $sum: "$amount" } } }, // sum debits+credits
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          month: { $dateToString: { date: "$_id", format: "%m-%Y", timezone: TZ } },
          // spend = max(0, -net)
          spendPaise: {
            $cond: [{ $lt: ["$netPaise", 0] }, { $multiply: ["$netPaise", -1] }, 0]
          }
        }
      }
    ]);

    res.json(rows.map(r => ({
      month: r.month,
      total: Math.round(r.spendPaise) / 100
    })));
  } catch (e) {
    console.error("byMonth error:", e);
    res.status(500).json({ error: "server_error" });
  }
};

