const router = require("express").Router();
const accCtrl = require("../controller/AccountController");
const { authMiddleware } = require("../Middleware/authmiddleware");

router.post("/create",authMiddleware, accCtrl.createAccount);
router.get("/getaccount", authMiddleware, accCtrl.getMyAccounts);

module.exports = router;