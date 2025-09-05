const router = require("express").Router();
const paymentCtrl = require("../controller/PaymentController");
<<<<<<< Updated upstream

router.post("/transfer", paymentCtrl.transfer);
router.post("/externalPayment", paymentCtrl.externalPayment);
=======
const { authMiddleware } = require("../Middleware/authmiddleware");

router.post("/transfer",authMiddleware, paymentCtrl.transfer);
router.post("/externalPayment",authMiddleware, paymentCtrl.externalPayment);
router.get("/paymentHistory",authMiddleware, paymentCtrl.paymentHistory);
>>>>>>> Stashed changes

module.exports = router;