// routes/auth.js
const express = require("express");
const { verifyRefresh, issueTokens } = require("../utils/jwt");


exports.refreshToken=(req, res)=>{
    const refreshToken = req.headers.cookie;
 
  if (!refreshToken) return res.status(401).json({ error: "No refresh token" });
    const token = refreshToken.split("=")[1];
  try {
    const payload = verifyRefresh(token);
    const tokens = issueTokens(payload.sub);
    // Send only new access token, refresh stays same
    res.setHeader("x-new-access-token", tokens.access);
    res.json({ access: tokens.access });
  } catch (err) {
    return res.status(401).json({ error: "Invalid refresh token" });
  }
};

