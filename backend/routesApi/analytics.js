const router = require("express").Router();
const Analytics = require("../controller/AnalyticsController.js"); // adjust path if needed
const { authMiddleware } = require("../Middleware/authmiddleware");       // your auth

router.get("/by-category", authMiddleware, Analytics.byCategory);
router.get("/by-month",    authMiddleware, Analytics.byMonth);
router.get("/monthly-income", authMiddleware, Analytics.monthlyIncome);
module.exports = router;
