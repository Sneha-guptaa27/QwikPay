const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer")) {
        return res.status(403).json({msg:"header required"});  //unauthorised access
    }
    const token = authHeader.split(" ")[1]; 
    try {
        const decoded = jwt.verify(token, secret);
        req.userId = decoded.userId;
        next();
    }
    catch(error) {
        return res.status(403).json({msg:error});
    }
}

module.exports = { authMiddleware };