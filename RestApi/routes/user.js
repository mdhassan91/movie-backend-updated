var express = require("express");
const Event = require("../model/event");
const { auth } = require("../middleware/auth");
const User = require("../model/user");

var router = express.Router();

router.put("/", async (req, res) => {
  const { Email } = req.body;
  await User.create({ Email: Email });
  return res.status(200).json({ ok: true, msg: "new user added" });
});
router.get("/", auth, async (req, res) => {
  var user = await User.findOne({ _id: req.user._id });
  return res.status(200).json({ ok: true, data: user });
});
router.post("/", auth, async (req, res) => {
  const { Email, Password } = req.body;
  //TODO validate req.body
  await User.findOneAndUpdate({ _id: req.user._id }, { Email, Password });
  return res.status(200).json({ ok: true, msg: "User Edited" });
});

module.exports = router;
