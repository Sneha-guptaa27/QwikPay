const jwt = require("jsonwebtoken");
const { User } = require("../models/userSchema");
const { verifyAccess } = require("../utils/jwt");
const secret = process.env.ACCESS_SECRET;
async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "No token" }); //unauthorised access
  }
  const parts = authHeader.split(" ");
  if (parts.length !== 2) {
    return res.status(401).json({ error: "invalid token" });
  }
  const token = parts[1];
  try {
    const decoded = verifyAccess(token);
    const user = await User.findById(decoded.sub);
    if (!user) {
      return es.status(401).json({ error: "No User" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ msg: error });
  }
 }

module.exports = { authMiddleware };
