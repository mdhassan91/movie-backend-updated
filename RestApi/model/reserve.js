const mongoose = require("mongoose");

const reserveSchema = new mongoose.Schema({
  reserveDate: { type: Date, required: true },
  reserveUserID: { type: String, required: true },
  Firstname: { type: String, default: "User" },
  Lastname: { type: String, default: "User" },
  Phonenumber: { type: String },
  Email: { type: String, default: "movie@srh.com" },
  reservedEventID: { type: mongoose.Schema.ObjectId, required: true },
  SeatsDetails: [],
});

const Reserve = mongoose.model("Reserve", reserveSchema);

module.exports = Reserve;
