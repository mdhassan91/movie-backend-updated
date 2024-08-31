const mongoose = require("mongoose");

const reserveSchema = new mongoose.Schema({
  reserveDate: { type: Date, required: true },
  reserveUserID: { type: String, required: true },
  Firstname: { type: String, default: "User" },
  Lastname: { type: String, default: "User" },
  Phonenumber: { type: String },
  Email: { type: String, default: "movie@srh.com" },
  reservedEventID: { type: mongoose.Schema.ObjectId, required: true },
  SeatsDetails: [
    {
      row: { type: Number, required: true },
      number: { type: Number, required: true },
      reserveSeatID: { type: mongoose.Schema.ObjectId, required: true },
    },
  ],
  reserveShowtime: {
    day: { type: String,required:true },
    time: { type: String ,required:true },
  },
});

const Reserve = mongoose.model("Reserve", reserveSchema);

module.exports = Reserve;
