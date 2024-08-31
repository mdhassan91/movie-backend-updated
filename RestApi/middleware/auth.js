const jwt = require("jsonwebtoken");
const User = require("../model/user");

exports.auth = async (req, res, next) => {
  console.log(req.headers); // Log all headers for debugging

  try {
    const token = req.header("x-auth-token");
    if (!token) {
      return res.status(401).json({ err: "No token provided." });
    }

    const decoded = jwt.verify(token, process.env.USER_KEY);
    const user = await User.findOne({ _id: decoded._id,  });
    console.log(user);

    if (!user) {
      return res.status(401).json({ err: "User not found." });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    return res.status(403).json({ err: "Invalid token." });
  }
};
