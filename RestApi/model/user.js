const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  Email: {
    type: String,
  },
  Password: {
    type: String,
    default: "123",
  },
  verifiedEmail: { type: Boolean, default: false },
  isSuperAdmin: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  verifyCode: { type: Number, default: "99999999" },
  Logins: [
    {
      Date: { type: Date, default: Date.now() },
      Device: { type: String },
    },
  ],
});

userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { _id: this._id, Email: this.Email, Password: this.Password },
    process.env.USER_KEY
  );
};

const User = mongoose.model("User", userSchema);

module.exports = User;
