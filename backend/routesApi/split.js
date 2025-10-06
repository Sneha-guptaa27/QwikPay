const router = require("express").Router();
const splitCtrl = require("../controller/SplitController");

router.post("/createSplit", splitCtrl.createSplit);
router.post("/payDUe/:id", splitCtrl.payDue);

module.exports = router;