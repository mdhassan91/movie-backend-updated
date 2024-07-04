var express = require("express");
const Event = require("../model/event");
const { auth } = require("../middleware/auth");
const User = require("../model/user");

var router = express.Router();

router.get("/", async (req, res) => {
  User.find().then((doc, err) => {
    if (doc) return res.send({ Ok: true, data: doc });
    else {
      return res.send({ ok: false });
    }
  });
});

router.put("/addadmin", auth, async (req, res) => {
  const { Email } = req.body;
  //TODO validate req.body
  await User.create({
    Email: Email,
  });
  return res.status(200).json({ ok: true, msg: "new Admin added" });
});
router.delete("/addadmin", auth, async (req, res) => {
  const { Email } = req.body;
  //TODO validate req.body
  await User.create({
    Email: Email,
  });
  return res.status(200).json({ ok: true, msg: "new Admin added" });
});
module.exports = router;
