const express = require('express');
const router = express.Router(); //to manage all the routes in backend
<<<<<<< Updated upstream
const userRouter = require('./userRoute');//-r
const accountRouter = require('./account');//-r
const accRouter = require("./acc");
const authRouter = require("./auth");
const refreshRouter = require("./refresh");
const expenseRouter = require("./payment");
const paymentRouter = require("./payment");
const splitRouter = require("./split");

router.use("/account", accRouter);
router.use("/acc", accountRouter); //-r
router.use("/user", userRouter);
=======
const accRouter = require("./acc");
const authRouter = require("./auth");
const refreshRouter = require("./refresh");
const expenseRouter = require("./expense");
const paymentRouter = require("./payment");
const splitRouter = require("./split");
const searchRouter = require("./searchUser");

router.use("/account", accRouter);
>>>>>>> Stashed changes
router.use("/auth", refreshRouter);
router.use("/auth", authRouter);
router.use("/expense", expenseRouter);
router.use("/payment", paymentRouter);
router.use("/split", splitRouter);
<<<<<<< Updated upstream
=======
router.use("/users", searchRouter);
>>>>>>> Stashed changes
module.exports = router;
