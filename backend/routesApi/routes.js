const express = require('express');
const router = express.Router(); //to manage all the routes in backend
const accRouter = require("./acc");
const authRouter = require("./auth");
const refreshRouter = require("./refresh");
const expenseRouter = require("./expense");
const paymentRouter = require("./payment");
const splitRouter = require("./split");
const analyticsRouter = require("./analytics");


router.use("/account", accRouter);
router.use("/auth", refreshRouter);
router.use("/auth", authRouter);
router.use("/expense", expenseRouter);
router.use("/payment", paymentRouter);
router.use("/split", splitRouter);
router.use("/analytics",analyticsRouter);


module.exports = router;
