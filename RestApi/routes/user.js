var express = require("express");
const Event = require("../model/event");
const { auth } = require("../middleware/auth");
const User = require("../model/user");
const { isEmail } = require("validator");

var router = express.Router();

router.put("/", async (req, res) => {
  const { Email } = req.body;
  if (!isEmail(Email))
    return res.status(400).json({ ok: false, msg: "check input" });
  var user = await User.exists({ Email: Email });
  if (user)
    return res.status(400).json({ ok: false, msg: "user already exist" });
  var verifyCode = Math.floor(Math.random() * (99999 - 10000)) + 10000;

  await User.create({ Email, verifyCode });
  return res.status(200).json({ ok: true, msg: "new user Added" });
});

//TODO check for is email verified
router.post("/login", async (req, res) => {
  const { Email, Password } = req.body;
  if (!isEmail(Email) || !Password.length < 5)
    return res.status(400).json({ ok: false, msg: "check input" });
  var user = await User.findOne({ Email: Email, Password: Password });
  if (user) {
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
  const { Email, Password } = req.body;
  if (!isEmail(Email) || !Password.length < 5)
    return res.status(400).json({ ok: false, msg: "check input" });

  await User.findOneAndUpdate({ _id: req.user._id }, { Email, Password });
  return res.status(200).json({ ok: true, msg: "user Edited" });
});
router.post("/verify", async (req, res) => {
  const { verifyCode, Email } = req.body;
  if (!isEmail(Email) || !verifyCode.length != 5)
    return res.status(400).json({ ok: false, msg: "check input" });
  var user = await User.findOneAndUpdate(
    { Email, verifyCode },
    { verifyCode: "99999999" },
    { new: true }
  );

  if (user) return res.status(200).json({ ok: true, data: user });
  else return res.status(404).json({ ok: false, msg: "user not found" });
});

module.exports = router;
