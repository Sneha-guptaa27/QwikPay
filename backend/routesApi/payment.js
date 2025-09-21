const router = require("express").Router();
const paymentCtrl = require("../controller/PaymentController");
const { authMiddleware } = require("../Middleware/authmiddleware");

router.post("/transfer",authMiddleware, paymentCtrl.transfer);
router.post("/externalPayment",authMiddleware, paymentCtrl.externalPayment);
router.get("/paymentHistory",authMiddleware, paymentCtrl.paymentHistory);

module.exports = router;