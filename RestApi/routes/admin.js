var express = require("express");
const Event = require("../model/event");
const { auth } = require("../middleware/auth");
const User = require("../model/user");
const { isEmail } = require("validator");

var router = express.Router();

router.get("/", async (req, res) => {
  User.find().then((doc, err) => {
    if (doc) return res.send({ Ok: true, data: doc });
    else {
      return res.send({ ok: false });
    }
  });
});

router.put("/", auth, async (req, res) => {
  const { Email } = req.body;
  if (!isEmail(Email))
    return res.status(400).json({ ok: false, msg: "check input" });

  await User.create({
    Email: Email,
  });
  return res.status(200).json({ ok: true, msg: "new Admin added" });
});
router.delete("/", auth, async (req, res) => {
  const { Email } = req.body;
  if (!isEmail(Email))
    return res.status(400).json({ ok: false, msg: "check input" });

  await User.create({
    Email: Email,
  });
  return res.status(200).json({ ok: true, msg: "new Admin added" });
});
module.exports = router;
