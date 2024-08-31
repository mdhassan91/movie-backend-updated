var express = require("express");
const Event = require("../model/event");
const Reserve = require("../model/reserve"); // Adjust the path as necessary

const { auth } = require("../middleware/auth");
const User = require("../model/user");
const { isEmail } = require("validator");
var router = express.Router();
const mongoose = require("mongoose");

router.put("/", async (req, res) => {
  const { Name, Username, Password, Email } = req.body;
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

  var user = new User({ Name, Username });
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
  // console.log(req.body);
  if (Password.length < 5)
    return res.status(400).json({ ok: false, msg: "check input" });
  // var user = await User.findOne({ Username: Username });
  const user = await User.findOne({ Username });
  if (!user) {
    return res.status(400).json({ ok: false, msg: "User not found" });
  }
  var passCheck = await user.validatePassword(Password);
  console.log("Pass Check>>>", passCheck);

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
// Get events by user ID
// GET a user by ID
// router.get("/:id", async (req, res) => {
//   const userId = req.params.id;

//   // try {
//   //   const user = await User.findById(userId);
//   //   if (!user) {
//   //     return res.status(404).json({ ok: false, msg: "User not found" });
//   //   }
//   //   return res.status(200).json({ ok: true, data: user });
//   // } catch (error) {
//   //   return res.status(500).json({ ok: false, error: error.message });
//   // }
//   var user = await User.findOne({ _id: userId });
//   return res.status(200).json({ ok: true, data: user });
// });

router.get("/:id", async (req, res) => {
  const userId = req.params.id.trim(); // Trim any extraneous whitespace

  // Check if the userId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ ok: false, msg: "Invalid user ID" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ ok: false, msg: "User not found" });
    }
    return res.status(200).json({ ok: true, data: user });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
});

router.post("/", auth, async (req, res) => {
  const { Name, Username, Password, Email } = req.body;
  console.log(req.body);
  // console.log(req)
  // if (!Password.length < 5)
  //   return res.status(400).json({ ok: false, msg: "check input" });
  if (Password.length < 5) {
    return res
      .status(400)
      .json({ ok: false, msg: "Password must be at least 5 characters long" });
  }

  var user = await User.findOne({ _id: req.user._id });

  if (Password) user.Password = await user.createHash(Password);
  // user.Password = Password;
  if (Name) user.Name = Name;
  // if (Username) user.Username = Username;
  user.Email = Email;
  await user.save();
  return res.status(200).json({ ok: true, msg: "user Edited" });
});

router.get("/users/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const users = await User.find({ createdBy: userId });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving events", error });
  }
});
router.post("/users/:userId", async (req, res) => {
  const userId = req.params.userId;

  const { Name, Username, Password, Email, Role } = req.body;
  //TODO check for empty
  if (!["event-manager", "movie-seller", "manager"].includes(Role)) {
    return res.status(400).send("Invalid role type.");
  }

  if (!isEmail(Email)) {
    return res.status(400).json({ ok: false, msg: "check Email" });
  }
  var userMail = await User.exists({ Email: Email });
  var user = await User.exists({ Username: Username });
  if (user || userMail)
    return res
      .status(400)
      .json({
        ok: false,
        msg: "Username or Email already exists. Please Try Diiferent Username or Email.",
      });
  //TODO HASH password

  var user = new User({ Name, Username, Password, Role, createdBy: userId });
  // user.Password = await user.createHash(Password);
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

router.put("/users/:userId", async (req, res) => {
  const userId = req.params.userId;
  const { Name, Username, Password, Email, Role } = req.body;

  // Validate role
  if (Role && !["event-manager", "movie-seller", "manager"].includes(Role)) {
    return res.status(400).send("Invalid role type.");
  }

  // Validate email
  if (Email && !isEmail(Email)) {
    return res.status(400).json({ ok: false, msg: "Invalid email format" });
  }

  try {
    // Check for existing email or username (if they are being updated)
    if (Email) {
      const userMail = await User.exists({ Email: Email });
      if (userMail && userMail._id.toString() !== userId) {
        return res.status(400).json({ ok: false, msg: "Email already in use" });
      }
    }

    if (Username) {
      const user = await User.exists({ Username: Username });
      if (user && user._id.toString() !== userId) {
        return res
          .status(400)
          .json({ ok: false, msg: "Username already in use" });
      }
    }

    // Find the user and update their details
    const updatedUser = await User.findById(userId);
    if (!updatedUser) {
      return res.status(404).json({ ok: false, msg: "User not found" });
    }

    // Update fields if they exist in the request body
    if (Name) updatedUser.Name = Name;
    if (Username) updatedUser.Username = Username;
    if (Email) updatedUser.Email = Email;
    if (Role) updatedUser.Role = Role;
    if (Password) {
      // Hash the password before saving
      updatedUser.Password = await updatedUser.createHash(Password);
    }

    await updatedUser.save();
    return res.status(200).json({ ok: true, data: updatedUser });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ ok: false, error: "User not found" });
    }
    return res.status(200).json({ ok: true, data: deletedUser });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
});

router.delete("/manager/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ ok: false, error: "User not found" });
    }

    // Find and delete all events associated with this user
    const events = await Event.find({ eventAdmin: userId });

    if (events.length > 0) {
      // Extract event IDs
      const eventIds = events.map((event) => event._id);

      // Delete all reservations associated with these events
      await Reserve.deleteMany({ reservedEventID: { $in: eventIds } });

      // Delete all events associated with this user
      await Event.deleteMany({ _id: { $in: eventIds } });
    }

    // Delete the user
    const deletedUser = await User.findByIdAndDelete(userId);

    return res.status(200).json({ ok: true, data: deletedUser });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
});

router.post("/forgot-password", async (req, res) => {
  const { Username, newPassword } = req.body;

  if (!Username || !newPassword) {
    return res
      .status(400)
      .json({ ok: false, msg: "Username and new password are required" });
  }

  if (newPassword.length < 5) {
    return res
      .status(400)
      .json({ ok: false, msg: "Password must be at least 5 characters long" });
  }

  try {
    // Find the user by their username
    const user = await User.findOne({ Username });

    if (!user) {
      return res.status(404).json({ ok: false, msg: "User not found" });
    }

    // Update the user's password
    user.Password = await user.createHash(newPassword);
    await user.save();

    return res
      .status(200)
      .json({ ok: true, msg: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({ ok: false, msg: "Server error" });
  }
});

module.exports = router;
