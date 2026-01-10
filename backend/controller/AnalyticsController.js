const Expense = require("../models/Expense");

/*
FINAL FINANCIAL LOGIC (for YOUR app):

• amount is stored in PAISE
• Negative  → expense
• Positive  → refund / cashback
• ALL categories INCLUDED (including TRANSFER)
• NET SPEND = ABS(SUM(amount))
• Convert to RUPEES at the END
*/

// ===============================
// 🥧 PIE CHART – NET Spend by Category
// ===============================
exports.byCategory = async (req, res) => {
  try {
    const userId = req.user._id;

    const month = Number(req.query.month);
    const year = Number(req.query.year);

    const now = new Date();
    const m = month ? month - 1 : now.getMonth();
    const y = year || now.getFullYear();

    // filter by TRANSACTION date
    const startDate = new Date(Date.UTC(y, m, 1));
    const endDate = new Date(Date.UTC(y, m + 1, 1));

    const data = await Expense.aggregate([
      {
        $match: {
          userId,
          date: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $addFields: {
          amountPaise: { $toLong: "$amount" },
          categoryUpper: {
            $cond: [
              { $ifNull: ["$category", false] },
              { $toUpper: "$category" },
              "OTHER",
            ],
          },
        },
      },
      {
        $group: {
          _id: "$categoryUpper",
          netPaise: { $sum: "$amountPaise" },
        },
      },

      // ✅ REAL SPENDING ONLY
      {
        $match: {
          netPaise: { $lt: 0 },
          _id: { $ne: "TRANSFER" },
        },
      },

      {
        $project: {
          _id: 0,
          category: "$_id",
          total: {
            $round: [
              { $divide: [{ $abs: "$netPaise" }, 100] },
              2,
            ],
          },
        },
      },

      { $sort: { total: -1 } },
    ]);

    res.json(data);
  } catch (err) {
    console.error("byCategory error:", err);
    res.status(500).json({ error: "server_error" });
  }
};


// ===============================
// 📊 BAR GRAPH – NET Monthly Spend
// ===============================
// ===============================
// 📊 BAR GRAPH – Monthly Spend
// ===============================
exports.byMonth = async (req, res) => {
  try {
    const userId = req.user._id;

    const data = await Expense.aggregate([
      // 1️⃣ Only this user
      { $match: { userId } },

      // 2️⃣ ONLY MONEY SPENT (NEGATIVE AMOUNTS)
      { $match: { amount: { $lt: 0 } } },

      // 3️⃣ Normalize date
      {
        $addFields: {
          dateObj: { $toDate: "$date" },
        },
      },

      // 4️⃣ Group by month + year
      {
        $group: {
          _id: {
            year: { $year: "$dateObj" },
            month: { $month: "$dateObj" },
          },
          spentPaise: { $sum: "$amount" }, // sum of negatives
        },
      },

      // 5️⃣ Sort chronologically
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },

      // 6️⃣ Convert to rupees
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              { $toString: "$_id.month" },
              "-",
              { $toString: "$_id.year" },
            ],
          },
          total: {
            $round: [
              { $divide: [{ $abs: "$spentPaise" }, 100] },
              2,
            ],
          },
        },
      },
    ]);

    res.json(data);
  } catch (err) {
    console.error("byMonth error:", err);
    res.status(500).json({ error: "server_error" });
  }
};
//money received 
exports.monthlyIncome = async (req, res) => {
  try {
    const userId = req.user._id;

    const year = Number(req.query.year) || new Date().getFullYear();

    const startDate = new Date(Date.UTC(year, 0, 1));
    const endDate = new Date(Date.UTC(year + 1, 0, 1));

    const data = await Expense.aggregate([
      {
        $match: {
          userId,
          date: { $gte: startDate, $lt: endDate },
          amount: { $gt: 0 }, // ✅ money received
        },
      },
      {
        $group: {
          _id: { $month: "$date" },
          totalPaise: { $sum: "$amount" },
        },
      },
      {
        $project: {
          _id: 0,
          month: "$_id",
          total: {
            $round: [{ $divide: ["$totalPaise", 100] }, 2],
          },
        },
      },
      { $sort: { month: 1 } },
    ]);

    res.json(data);
  } catch (err) {
    console.error("monthlyIncome error:", err);
    res.status(500).json({ error: "server_error" });
  }
};
