const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const userSchema = new mongoose.Schema({
  Name: {
    type: String,
  },

  Username: {
    type: String,
  },

  Email: {
    type: String,
  },
  Password: {
    type: String,
    default: "123",
  },
  verifiedEmail: { type: Boolean, default: false },
  Role: {
    type: String,
    default: "user",
    enum: ["user", "manager", "movie-seller", "event-manager", "super-admin"],
  },
  Logins: [
    {
      Date: { type: Date, default: Date.now() },
      Device: { type: String },
    },
  ],
  
  createdBy: { type: mongoose.Schema.ObjectId },

});

userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { _id: this._id, Email: this.Email, Password: this.Password },
    process.env.USER_KEY
  );
};
// Method to generate a hash from plain text
userSchema.methods.createHash = async function (plainTextPassword) {
  // Hashing user's salt and password with 10 iterations,
  const saltRounds = 10;

  // First method to generate a salt and then create hash
  const salt = await bcrypt.genSalt(saltRounds);
  return await bcrypt.hash(plainTextPassword, salt);

  // Second mehtod - Or we can create salt and hash in a single method also
  // return await bcrypt.hash(plainTextPassword, saltRounds);
};

// Validating the candidate password with stored hash and hash function
userSchema.methods.validatePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.Password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
