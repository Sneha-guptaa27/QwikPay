const router = require("express").Router();
const expCtrl = require("../controller/ExpenseController");
const { authMiddleware } = require("../Middleware/authmiddleware");

router.get("/list",authMiddleware, expCtrl.list);
router.post("/create",authMiddleware, expCtrl.create);
router.post("/upload", authMiddleware, expCtrl.upload);
router.get("/upload/:jobId", authMiddleware, expCtrl.getjob);
router.get("/attachment/:id", authMiddleware, expCtrl.getAttachment);
router.get("/attachment/text/:id", authMiddleware, expCtrl.getAttachmentText);
// NEW Excel endpoints:
router.post('/attachment/xls', authMiddleware, expCtrl.uploadXls);
router.post('/attachment/:id/commit', authMiddleware, expCtrl.commitXls);
router.get("/expenses", authMiddleware, expCtrl.getExpenses);


module.exports = router;