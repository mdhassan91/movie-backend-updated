var express = require("express");
const Event = require("../model/event");
const { auth } = require("../middleware/auth");
const User = require("../model/user");
const { isEmail } = require("validator");
var router = express.Router();





router.put("/", async (req, res) => {
  const {Name, Username, Password, Email } = req.body;
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

  var user = new User({ Name,Username });
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

// router.put("/", async (req, res) => {
//   const { Name, Username, Password, Email } = req.body;
//   console.log(req.body);

//   // Check for empty fields (optional, adjust as needed)
//   if (!Name || !Username || !Password || !Email) {
//     return res
//       .status(400)
//       .json({ ok: false, msg: "Please fill in all fields." });
//   }

//   // Validate email format
//   if (!isEmail(Email)) {
//     return res.status(400).json({ ok: false, msg: "Invalid email format." });
//   }

//   // Check for existing user by email and username (combine checks)
//   const existingUser = await User.findOne({ $or: [{ Email }, { Username }] });
//   if (existingUser) {
//     return res
//       .status(400)
//       .json({ ok: false, msg: "Username or email already exists." });
//   }

//   // Hash password before creating user
//   const hashedPassword = await user.createHash(Password);

//   // Create new user instance
//   let user = new User({ Name, Username, Email, Password: hashedPassword });

//   try {
//     await user.save();
//     const token = user.generateAuthToken();
//     return res.status(201).json({ ok: true, data: { token } }); // Use 201 for created resources
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ ok: false, msg: "Error creating user." });
//   }
// });

router.post("/login", async (req, res) => {
  const { Username, Password } = req.body;
  console.log(req.body);
  if (Password.length < 5)
    return res.status(400).json({ ok: false, msg: "check input" });
  // var user = await User.findOne({ Username: Username });
  const user = await User.findOne({ Username });
  if (!user) {
    return res.status(400).json({ ok: false, msg: "User not found" });
  }
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
  console.log(req.body)
  console.log(req)
  // if (!Password.length < 5 || !isEmail(Email))
  //   return res.status(400).json({ ok: false, msg: "check input" });

  var user = await User.findOne({ _id: req.user._id });
  user.Password = await user.createHash(Password);
  user.Username = Username;
  user.Email = Email;
  await user.save();
  return res.status(200).json({ ok: true, msg: "user Edited" });
});

module.exports = router;
