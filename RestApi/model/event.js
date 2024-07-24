const mongoose = require("mongoose");

//TODO next version add movie schema and movieId to this schema

const eventSchema = new mongoose.Schema({
  createdDate: { type: Date, default: Date.now },
  eventDate: { type: Date, required: true },
  eventName: { type: String, required: true },
  // eventAdmin: { type: mongoose.Schema.ObjectId, required: true },

  eventType: { type: "String", enum: ["movie", "activity", "event"] },
  genre: { type: String },
  activityType: { type: String, enum: ["outdoor", "indoor"] },
  eventCategory: { type: String },

  eventDetails: {
    type: String,
    default: "please add some details about event",
  },
  Seats: [
    {
      row: { type: Number, required: true },
      number: { type: Number, required: true },
      reserveID: { type: mongoose.Schema.ObjectId },
      isAvailable: { type: Boolean, default: true },
    },
  ],
});

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
