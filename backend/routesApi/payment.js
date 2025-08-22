const router = require("express").Router();
const paymentCtrl = require("../controller/PaymentController");

router.post("/transfer", paymentCtrl.transfer);
router.post("/externalPayment", paymentCtrl.externalPayment);

module.exports = router;