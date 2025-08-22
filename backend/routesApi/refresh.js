const router = require('express').Router();
const refreshCtrl = require("../controller/RefreshController");

router.post("/refresh", refreshCtrl.refreshToken);

module.exports = router;