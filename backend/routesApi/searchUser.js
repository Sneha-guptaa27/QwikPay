const router = require("express").Router();
const User = require("../models/userSchema");

// Search user by firstName / upiId / phone
router.get("/search", async (req, res) => {
  try {
    const q = req.query.q;
    if (!q) return res.json([]);

    const users = await User.find({
      $or: [
        { firstName: { $regex: q, $options: "i" } },
        { upiId: { $regex: q, $options: "i" } },
        { phoneNumber: { $regex: q, $options: "i" } },
      ],
    }).select("firstName upiId phoneNumber");

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
