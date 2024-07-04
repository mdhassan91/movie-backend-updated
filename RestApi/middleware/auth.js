const jwt = require("jsonwebtoken");

//TODO improve this code
exports.auth = function (req, res, next) {
  try {
    const token = req.header("x-auth-token");
    const decoded = jwt.verify(token, process.env.USER_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    console.log(error);
    return res.status(403).json({ err: "Invalid Token." });
  }
};
