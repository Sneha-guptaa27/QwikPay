const router = require("express").Router();
const paymentCtrl = require("../controller/PaymentController");
const { authMiddleware } = require("../Middleware/authmiddleware");

// Internal transfers
router.post("/transfer", authMiddleware, paymentCtrl.transfer);

// Razorpay
router.post("/createExternalOrder", authMiddleware, paymentCtrl.createExternalOrder); 
router.post("/verifyExternalPayment", authMiddleware, paymentCtrl.verifyExternalPayment);

// History
router.get("/paymentHistory", authMiddleware, paymentCtrl.paymentHistory);

module.exports = router;
