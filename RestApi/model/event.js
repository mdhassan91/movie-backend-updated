const mongoose = require("mongoose");

//TODO next version add movie schema and movieId to this schema

const eventSchema = new mongoose.Schema({
  createdDate: { type: Date, default: Date.now },
  eventDate: { type: Date, required: true },
  eventName: { type: String, required: true },
  eventImgUrl: { type: String, required: true },

  eventAdmin: { type: mongoose.Schema.ObjectId, required: true },

  eventType: { type: "String", enum: ["movie", "activity", "event"] },
  genre: { type: String },
  activityType: { type: String, enum: ["outdoor", "indoor"] },
  eventCategory: { type: String },

  eventDetails: {

    type: String,
    default: "please add some details about event",
  },
  showtimes: [
    // {
    //   // showtimeDate: { type: Date, required: true },
    //   // additional properties if needed
    // },
    {
      dayOfWeek: {
        type: String,
        required: false,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      },
      times: {
        type: [String], // An array of strings representing the times like ["16:00", "18:00"]
        required: false,
        validate: {
          validator: function(array) {
            return array.length > 0; // Ensure at least one time is present
          },
          message: 'There must be at least one showtime per day',
        }
      }
    }
    
  ],
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
