var express = require("express");
const Event = require("../model/event");
const { auth } = require("../middleware/auth");
const User = require("../model/user");
const { isEmail } = require("validator");
var router = express.Router();

router.put("/", async (req, res) => {
  const { Username, Password, Email } = req.body;
  //TODO check for empty
  if (!isEmail(Email)) {
    return res.status(400).json({ ok: false, msg: "check Email" });
  }
  var userMail = await User.exists({ Email: Email });
  var user = await User.exists({ Username: Username });
  if (user || userMail)
    return res
      .status(400)
      .json({ ok: false, msg: "user already exist please login" });
  //TODO HASH password

  var user = new User({ Username });
  user.Password = await user.createHash(Password);
  user.Email = Email;

  await user.save();
  var token = user.generateAuthToken();
  return res.status(200).json({
    ok: true,
    data: {
      token: token,
    },
  });
});
router.post("/login", async (req, res) => {
  const { Username, Password } = req.body;
  if (Password.length < 5)
    return res.status(400).json({ ok: false, msg: "check input" });
  var user = await User.findOne({ Username: Username });
  var passCheck = await user.validatePassword(Password);
  if (user && passCheck) {
    var token = user.generateAuthToken();
    return res.status(200).json({ ok: true, data: { token: token } });
  } else {
    return res.status(400).json({ ok: false, msg: "user not found" });
  }
});
router.get("/", auth, async (req, res) => {
  var user = await User.findOne({ _id: req.user._id });
  return res.status(200).json({ ok: true, data: user });
});
router.post("/", auth, async (req, res) => {
  const { Username, Password, Email } = req.body;
  if (!Password.length < 5 || !isEmail(Email))
    return res.status(400).json({ ok: false, msg: "check input" });

  var user = await User.findOne({ _id: req.user._id });
  user.Password = await user.createHash(Password);
  user.Username = Username;
  user.Email = Email;
  await user.save();
  return res.status(200).json({ ok: true, msg: "user Edited" });
});

module.exports = router;
