// utils/jwt.js
const jwt = require("jsonwebtoken");
const ACCESS_SECRET = process.env.ACCESS_SECRET || "access-secret";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "refresh-secret";

function issueTokens(userId) {
  const access = jwt.sign({ sub: userId }, ACCESS_SECRET, { expiresIn: "15m" });
  const refresh = jwt.sign({ sub: userId }, REFRESH_SECRET, { expiresIn: "30d" });
  return { access, refresh };
}

function verifyAccess(token) {
  return jwt.verify(token, ACCESS_SECRET);
}
function verifyRefresh(token) {
  return jwt.verify(token, REFRESH_SECRET);
}

module.exports = { issueTokens, verifyAccess,verifyRefresh };