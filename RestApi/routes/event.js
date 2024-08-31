var express = require("express");
const Event = require("../model/event");
const Reserve = require("../model/reserve"); // Adjust the path as necessary
var mongoose = require("mongoose");

const { auth } = require("../middleware/auth");
const User = require("../model/user");
const { isDate } = require("validator");
const {
  isEnglish,
  isNumeric,
  isEventType,
  isActivityType,
} = require("../../utils/validators");

var router = express.Router();

router.get("/", async (req, res) => {
  var { all } = req.query;
  if (all == "true") all = true;
  if (all == "false") all = false;
  if (typeof all != "boolean")
    return res.status(400).json({ ok: false, msg: "check input" });

  var data;
  if (all) {
    data = await Event.find({});
  } else {
    data = await Event.find({ eventAdmin: req.user._id });
  }

  return res.status(200).json({ ok: true, data: data });
});

router.get("/:eventId", async (req, res) => {
  try {
    const eventId = req.params.eventId; // Extract the eventId from the URL params
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ ok: false, msg: "Event not found" });
    }

    res.status(200).json({ ok: true, data: event });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: "Internal server error" });
  }
});

router.delete("/", auth, async (req, res) => {
  const { eventID } = req.body;

  var event = Event.findOneAndDelete(
    {
      _id: eventID,
      // eventAdmin: req.user._id,
    },
    { new: true }
  );
  if (event) return res.status(200).json({ ok: true, msg: "event deleted" });
  return res.status(404).json({ ok: false, msg: "event not fount" });
});

router.delete("/:eventId", async (req, res) => {
  const eventId = req.params.eventId; // Extract eventId from URL params

  try {
    const deletedEvent = await Event.findByIdAndDelete(eventId);

    if (!deletedEvent) {
      return res.status(404).json({ ok: false, msg: "Event not found" });
    }

    res.status(200).json({ ok: true, msg: "Event deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: "Internal server error" });
  }
});
//Old Working One
// router.post("/", auth, async (req, res) => {
//   const { eventID, eventName, eventDate, eventDetails, Rows, seatsPerRow } =
//     req.body;
//   if (
//     !isDate(eventDate) ||
//     !isEnglish(eventDetails) ||
//     !isEnglish(eventName) ||
//     !isNumeric(Rows) ||
//     !isNumeric(seatsPerRow)
//   )
//     return res.status(400).json({ ok: false, msg: "check input" });

//   var seats = [];
//   for (let i = 1; i < Rows; i++) {
//     for (let j = 1; j < seatsPerRow; j++) {
//       seats.push({
//         row: i,
//         number: j,
//       });
//     }
//   }
//   Event.findOneAndUpdate(
//     {
//       // eventAdmin: req.user._id,
//       _id: eventID,
//     },
//     {
//       eventDate,
//       eventDetails,
//       seats,
//       eventName,
//     },
//     { new: true }
//   ).then((doc, err) => {
//     if (doc)
//       return res
//         .status(200)
//         .json({ ok: true, msg: "event edited successfully" });
//     else if (err)
//       return res.status(404).json({ ok: true, msg: "event not found" });
//   });
// });

//Nwe One to test
router.post("/:eventId", async (req, res) => {
  const { eventId } = req.params; // Extract event ID from URL params

  const { eventName, eventDate, eventDetails, Rows, seatsPerRow, showtimes,eventImgUrl,genre } = req.body;

  // Input validation
  // if (
  //   !isDate(eventDate) ||
  //   !isEnglish(eventDetails) ||
  //   !isEnglish(eventName) ||
  //   !isNumeric(Rows) ||
  //   !isNumeric(seatsPerRow)
  // )
  //   return res.status(400).json({ ok: false, msg: "Check input" });

  // Generate seat structure
  var seats = [];
  for (let i = 1; i <= Rows; i++) {  // Corrected loop ranges
    for (let j = 1; j <= seatsPerRow; j++) {  // Corrected loop ranges
      seats.push({
        row: i,
        number: j,
      });
    }
  }

  // Map showtimes to the new structure, if provided
  let updateData = {
    eventDate,
    eventDetails,
    seats,
    eventImgUrl,
    genre,
    eventName,
  };

  if (showtimes) {
    updateData.showtimes = showtimes.map(st => ({
      dayOfWeek: st.dayOfWeek,
      times: st.times // Assuming st.times is an array of time strings like ["16:00", "18:00"]
    }));
  }

  try {
    const updatedEvent = await Event.findOneAndUpdate(
      {
        // eventAdmin: req.user._id,  // Optional: Uncomment to enforce admin check
        _id: eventId,
      },
      updateData,
      { new: true }
    );

    if (updatedEvent) {
      return res.status(200).json({ ok: true, msg: "Event edited successfully" });
    } else {
      return res.status(404).json({ ok: false, msg: "Event not found" });
    }
  } catch (error) {
    console.error("Error updating event:", error);
    return res.status(500).json({ ok: false, msg: "Failed to edit event" });
  }
});



router.get("/events/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const events = await Event.find({ eventAdmin: userId });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving events", error });
  }
});

// Well i have remove auth middleware for now but i will makw add it later again
// router.post("/:eventId", async (req, res) => {
//   const { eventId } = req.params; // Extract event ID from URL params
//   const { eventName, eventDate, eventDetails, eventImgUrl,} =
//     req.body;

//   // Improved validation (consider using a validation library)
//   // if (
//   //   !eventId ||
//   //   !eventName ||
//   //   !eventDate ||
//   //   !eventDetails ||
//   //   !Rows ||
//   //   !seatsPerRow
//   // ) {
//   //   return res.status(400).json({ ok: false, msg: "Missing required fields" });
//   // }
//   if (
//     !eventId ||
//     !eventName ||
//     !eventDate ||
//     !eventDetails 

//   ) {
//     return res.status(400).json({ ok: false, msg: "Missing required fields" });
//   }

//   // Validate data types (assuming `isNumeric` is available for number checks)
//   // if (!isDate(eventDate) || !isNumeric(Rows) || !isNumeric(seatsPerRow)) {
//   //   return res.status(400).json({ ok: false, msg: 'Invalid data types' });
//   // }

//   const updatedSeats = [];
//   // for (let i = 1; i <= Rows; i++) {
//   //   // Ensure all seats are created (<= instead of <)
//   //   for (let j = 1; j <= seatsPerRow; j++) {
//   //     updatedSeats.push({ row: i, number: j });
//   //   }
//   // }

//   try {
//     const updatedEvent = await Event.findOneAndUpdate(
//       { _id: eventId }, // Match by event ID
//       {
//         eventName,
//         eventDate,
//         eventDetails,
//         // seats: updatedSeats,
//         eventImgUrl: eventImgUrl,
//       },
//       { new: true } // Return the updated document
//     );

//     if (!updatedEvent) {
//       return res.status(404).json({ ok: false, msg: "Event not found" });
//     }

//     res.status(200).json({
//       ok: true,
//       msg: "Event updated successfully",
//       data: updatedEvent,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ ok: false, msg: "Internal server error" });
//   }
// });



// router.put("/",auth ,async (req, res) => {
//   var {
//     eventDate,
//     eventName,
//     eventImgUrl,
//     eventDetails,
//     eventType,
//     genre,
//     acitivityType,
//     eventCategory,
//     Rows,
//     seatsPerRow,
//     showtimes,
//     // eventAdmin
//   } = req.body;
//   console.log(req.body);
//   console.log(auth.user._id);
//   // eventType = eventType.toLowerCase();
//   // acitivityType = acitivityType.toLowerCase();

//   // if (
//   //   !isDate(eventDate) ||
//   //   !isEnglish(eventDetails) ||
//   //   !isEnglish(eventName) ||
//   //   // !isNumeric(Rows) ||
//   //   // !isNumeric(seatsPerRow) ||
//   //   !isNumeric(String(Rows)) ||
//   // !isNumeric(String(seatsPerRow)) ||
//   //   // !validator.isNumeric(Rows) ||  // Use validator.isNumeric directly
//   //   // !validator.isNumeric(seatsPerRow) ||
//   //   !isEnglish(genre) ||
//   //   !isEnglish(eventCategory) ||
//   //   !isEventType(eventType) ||
//   //   !isActivityType(acitivityType)
//   // )
//   //   return res.status(400).json({ ok: false, msg: "check input" });

//   console.log({ Rows, seatsPerRow });
//   var seats = [];
//   for (let i = 1; i <= Rows; i++) {
//     for (let j = 1; j <= seatsPerRow; j++) {
//       seats.push({
//         row: i,
//         number: j,
//       });
//     }
//   }

//   // await Event.create({
//   //   eventDate: eventDate,
//   //   eventName: eventName,
//   //   // eventAdmin: auth.user._id,
//   //   eventImgUrl:eventImgUrl,
//   //   eventDetails: eventDetails,
//   //   Seats: seats,
//   //     // Assuming each showtime object in the array contains date and time
//   //     showtimes: showtimes.map((st) => ({
//   //       eventDate: new Date(`${st.date}T${st.time}:00Z`),
//   //       // additional properties if needed
//   //     })),
//   // });
//   // console.log(seats);
//   await Event.create({
//     eventDate: eventDate,
//     eventName: eventName,
//     eventImgUrl: eventImgUrl,
//     // eventAdmin: eventAdmin,
//     eventAdmin: auth.user._id,

//     eventDetails: eventDetails,
//     Seats: seats,
//     showtimes: showtimes.map((st) => ({
//       showtimeDate: new Date(`${st.date}T${st.time}:00Z`),
//       // additional properties if needed
//     })),
//   });
//   return res.status(200).json({ ok: true, msg: "Event Added Successfully" });
// });
//Working One
// router.put("/", auth, async (req, res) => {
//   const {
//     eventDate,
//     eventName,
//     eventImgUrl,
//     eventDetails,
//     eventType,
//     genre,
//     acitivityType,
//     eventCategory,
//     Rows,
//     seatsPerRow,
//     showtimes,
//     eventAdmin,
//   } = req.body;

//   console.log(req.body);
//   if (req.user) {
//     console.log("User ID from auth middleware:", req.user._id); // Debugging line
//   } else {
//     console.log("No user found in request.");
//   }

//   if (!mongoose.Types.ObjectId.isValid(eventAdmin)) {
//     return res.status(400).json({ ok: false, msg: "Invalid eventAdmin ID" });
//   }

//   var seats = [];
//   for (let i = 1; i <= Rows; i++) {
//     for (let j = 1; j <= seatsPerRow; j++) {
//       seats.push({
//         row: i,
//         number: j,
//       });
//     }
//   }

//   await Event.create({
//     eventDate: eventDate,
//     eventName: eventName,
//     eventImgUrl: eventImgUrl,
//     eventAdmin: eventAdmin,
//     eventDetails: eventDetails,
//     genre:genre,
//     eventType: eventType,
//     Seats: seats,
//     showtimes: showtimes.map((st) => ({
//       showtimeDate: new Date(`${st.date}T${st.time}:00Z`),
//     })),
//   });

//   return res.status(200).json({ ok: true, msg: "Event Added Successfully" });
// });

//New One Testing
router.put("/",auth, async (req, res) => {
  const {
    eventDate,
    eventName,
    eventImgUrl,
    eventDetails,
    eventType,
    genre,
    activityType,
    eventCategory,
    Rows,
    seatsPerRow,
    showtimes,
    eventAdmin,
  } = req.body;

  console.log(req.body);
  if (req.user) {
    console.log("User ID from auth middleware:", req.user._id); // Debugging line
  } else {
    console.log("No user found in request.");
  }

  if (!mongoose.Types.ObjectId.isValid(eventAdmin)) {
    return res.status(400).json({ ok: false, msg: "Invalid eventAdmin ID" });
  }

  // Generate seat structure
  var seats = [];
  for (let i = 1; i <= Rows; i++) {
    for (let j = 1; j <= seatsPerRow; j++) {
      seats.push({
        row: i,
        number: j,
      });
    }
  }

  // Map showtimes to the new structure
  const formattedShowtimes = showtimes.map(st => ({
    dayOfWeek: st.dayOfWeek,
    times: st.times // Assuming st.times is an array of time strings like ["16:00", "18:00"]
  }));

  try {
    await Event.create({
      eventDate: eventDate,
      eventName: eventName,
      eventImgUrl: eventImgUrl,
      eventAdmin: eventAdmin,
      eventDetails: eventDetails,
      genre: genre,
      eventType: eventType,
      activityType: activityType,
      eventCategory: eventCategory,
      Seats: seats,
      showtimes: formattedShowtimes,
    });

    return res.status(200).json({ ok: true, msg: "Event Added Successfully" });
  } catch (error) {
    console.error("Error creating event:", error);
    return res.status(500).json({ ok: false, msg: "Failed to add event" });
  }
});


// router.post("/movie", async (req, res) => {
//   const {
//     eventName,
//     eventImgUrl,
//     eventDetails,
//     genre,
//     eventType,
//     showtimes,
//     Rows,
//     seatsPerRow,
//   } = req.body;
//   var seats = [];
//   for (let i = 1; i <= Rows; i++) {
//     for (let j = 1; j <= seatsPerRow; j++) {
//       seats.push({
//         row: i,
//         number: j,
//       });
//     }
//   }

//   try {
//     const newEvent = new Event({
//       eventName,
//       eventDetails,
//       genre,
//       eventImgUrl,
//       eventType,
//       Seats: seats,
//       // Assuming each showtime object in the array contains date and time
//       showtimes: showtimes.map((st) => ({
//         eventDate: new Date(`${st.date}T${st.time}:00Z`),
//         // additional properties if needed
//       })),
//     });
//     await newEvent.save();
//     res.status(201).json(newEvent);
//   } catch (error) {
//     console.error("Error adding movie event:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });
// router.post("/movie", async (req, res) => {
//   const {
//     eventName,
//     eventImgUrl,
//     eventDetails,
//     genre,
//     eventType,
//     showtimes,
//     Rows,
//     seatsPerRow,
//   } = req.body;

//   if (
//     !eventName ||
//     !eventImgUrl ||
//     !eventDetails ||
//     !genre ||
//     !eventType ||
//     !showtimes ||
//     !Rows ||
//     !seatsPerRow
//   ) {
//     console.error("Missing fields:", {
//       eventName,
//       eventImgUrl,
//       eventDetails,
//       genre,
//       eventType,
//       showtimes,
//       Rows,
//       seatsPerRow,
//     });
//     return res.status(400).json({
//       ok: false,
//       msg: "Missing required fields",
//       log: {
//         eventName,
//         eventImgUrl,
//         eventDetails,
//         genre,
//         eventType,
//         showtimes,
//         Rows,
//         seatsPerRow,
//       },
//     });
//   }

//   let seats = [];
//   for (let i = 1; i <= Rows; i++) {
//     for (let j = 1; j <= seatsPerRow; j++) {
//       seats.push({
//         row: i,
//         number: j,
//       });
//     }
//   }

//   try {
//     const newEvent = new Event({
//       eventName,
//       eventImgUrl,
//       eventDetails,
//       genre,
//       eventType,
//       Seats: seats,
//       showtimes: showtimes.map((st) => ({
//         eventDate: new Date(`${st.date}T${st.time}:00Z`),
//       })),
//     });

//     await newEvent.save();
//     res.status(201).json(newEvent);
//   } catch (error) {
//     console.error("Error adding movie event:", error);
//     res.status(500).json({ ok: false, msg: "Server error" });
//   }
// });

module.exports = router;
