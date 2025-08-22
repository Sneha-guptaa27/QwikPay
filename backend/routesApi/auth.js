const router = require("express").Router();
const authCtrl = require("../controller/AuthController");

router.post("/otp/request", authCtrl.requestOtp);
router.post("/otp/verify", authCtrl.verifyOtp);

module.exports = router;