// node backend/scripts/normalizeAmounts.js
require("dotenv").config();
const mongoose = require("mongoose");
const Expense = require("../models/Expense");

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  // Heuristic: values that look like paise (very large)
  // e.g., > ₹200,000 per txn is unusual for normal spending; divide by 100.
  const cursor = Expense.find({ amount: { $gte: 200000 } }).cursor();
  let fixed = 0;

  for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
    // If description hints it's not a balance/summary AND divisible by 100 nicely
    if (doc.amount % 1 === 0 && doc.amount % 100 === 0) {
      const newAmt = doc.amount / 100;
      await Expense.updateOne({ _id: doc._id }, { $set: { amount: newAmt } });
      fixed++;
    }
  }

  console.log("normalized rows:", fixed);
  await mongoose.disconnect();
}

run().catch(e => { console.error(e); process.exit(1); });
