const express = require('express');
const userRouter = require('./userRoute');
const router = express.Router(); //to manage all the routes in backend
router.use("/user", userRouter);
module.exports = router;
