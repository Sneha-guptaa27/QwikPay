const express = require('express');
const router = express.Router(); //to manage all the routes in backend
const userRouter = require('./userRoute');
const accountRouter = require('./account');
router.use("/account", accountRouter);
router.use("/user", userRouter);
module.exports = router;
