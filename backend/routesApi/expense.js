const router = require("express").Router();
const expCtrl = require("../controller/ExpenseController");

router.post("/list", expCtrl.list);
router.post("/create", expCtrl.create);
router.post("/upload", expCtrl.upload);

module.exports = router;