var express = require("express");
const Event = require("../model/event");
const Reserve = require("../model/reserve"); // Adjust the path as necessary
// var mongoose = require("mongoose");

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

// const events = [
//   {
//     _id: mongoose.Types.ObjectId("60d5fbd6fc13ae1ab7000001"),
//     eventDate: new Date("2024-07-22T00:00:00.000Z"),
//     eventName: "Joker",
//     eventType: "movie",
//     genre: "Drama",
//     eventCategory: "B",
//     eventDetails: "Joker movie screening.",
//     Seats: [
//       { row: 1, number: 1, isAvailable: true },
//       { row: 1, number: 2, isAvailable: true },
//       { row: 1, number: 3, isAvailable: false },
//       { row: 1, number: 4, isAvailable: true },
//       { row: 1, number: 5, isAvailable: true },
//       { row: 2, number: 1, isAvailable: true },
//       { row: 2, number: 2, isAvailable: false },
//       { row: 2, number: 3, isAvailable: true },
//       { row: 2, number: 4, isAvailable: true },
//       { row: 2, number: 5, isAvailable: true },
//     ],
//   },
//   {
//     _id: mongoose.Types.ObjectId("60d5fbd6fc13ae1ab7000002"),
//     eventDate: new Date("2024-07-23T00:00:00.000Z"),
//     eventName: "Toy Story",
//     eventType: "movie",
//     genre: "Animation",
//     eventCategory: "C",
//     eventDetails: "Toy Story movie screening.",
//     Seats: [
//       { row: 1, number: 1, isAvailable: true },
//       { row: 1, number: 2, isAvailable: true },
//       { row: 1, number: 3, isAvailable: true },
//       { row: 1, number: 4, isAvailable: true },
//       { row: 1, number: 5, isAvailable: false },
//       { row: 2, number: 1, isAvailable: true },
//       { row: 2, number: 2, isAvailable: true },
//       { row: 2, number: 3, isAvailable: true },
//       { row: 2, number: 4, isAvailable: false },
//       { row: 2, number: 5, isAvailable: true },
//     ],
//   },
//   {
//     _id: mongoose.Types.ObjectId("60d5fbd6fc13ae1ab7000003"),
//     eventDate: new Date("2024-07-24T00:00:00.000Z"),
//     eventName: "The Lion King",
//     eventType: "movie",
//     genre: "Animation",
//     eventCategory: "A",
//     eventDetails: "The Lion King movie screening.",
//     Seats: [
//       { row: 1, number: 1, isAvailable: true },
//       { row: 1, number: 2, isAvailable: true },
//       { row: 1, number: 3, isAvailable: true },
//       { row: 1, number: 4, isAvailable: false },
//       { row: 1, number: 5, isAvailable: true },
//       { row: 2, number: 1, isAvailable: true },
//       { row: 2, number: 2, isAvailable: true },
//       { row: 2, number: 3, isAvailable: true },
//       { row: 2, number: 4, isAvailable: true },
//       { row: 2, number: 5, isAvailable: false },
//     ],
//   },
// ];

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

router.post("/", auth, async (req, res) => {
  const { eventID, eventName, eventDate, eventDetails, Rows, seatsPerRow } =
    req.body;
  if (
    !isDate(eventDate) ||
    !isEnglish(eventDetails) ||
    !isEnglish(eventName) ||
    !isNumeric(Rows) ||
    !isNumeric(seatsPerRow)
  )
    return res.status(400).json({ ok: false, msg: "check input" });

  var seats = [];
  for (let i = 1; i < Rows; i++) {
    for (let j = 1; j < seatsPerRow; j++) {
      seats.push({
        row: i,
        number: j,
      });
    }
  }
  Event.findOneAndUpdate(
    {
      // eventAdmin: req.user._id,
      _id: eventID,
    },
    {
      eventDate,
      eventDetails,
      seats,
      eventName,
    },
    { new: true }
  ).then((doc, err) => {
    if (doc)
      return res
        .status(200)
        .json({ ok: true, msg: "event edited successfully" });
    else if (err)
      return res.status(404).json({ ok: true, msg: "event not found" });
  });
});

// Well i have remove auth middleware for now but i will makw add it later again
router.post("/:eventId", async (req, res) => {
  const { eventId } = req.params; // Extract event ID from URL params
  const { eventName, eventDate, eventDetails, Rows, seatsPerRow } = req.body;

  // Improved validation (consider using a validation library)
  if (
    !eventId ||
    !eventName ||
    !eventDate ||
    !eventDetails ||
    !Rows ||
    !seatsPerRow
  ) {
    return res.status(400).json({ ok: false, msg: "Missing required fields" });
  }

  // Validate data types (assuming `isNumeric` is available for number checks)
  // if (!isDate(eventDate) || !isNumeric(Rows) || !isNumeric(seatsPerRow)) {
  //   return res.status(400).json({ ok: false, msg: 'Invalid data types' });
  // }

  const updatedSeats = [];
  for (let i = 1; i <= Rows; i++) {
    // Ensure all seats are created (<= instead of <)
    for (let j = 1; j <= seatsPerRow; j++) {
      updatedSeats.push({ row: i, number: j });
    }
  }

  try {
    const updatedEvent = await Event.findOneAndUpdate(
      { _id: eventId }, // Match by event ID
      { eventName, eventDate, eventDetails, seats: updatedSeats },
      { new: true } // Return the updated document
    );

    if (!updatedEvent) {
      return res.status(404).json({ ok: false, msg: "Event not found" });
    }

    res.status(200).json({
      ok: true,
      msg: "Event updated successfully",
      data: updatedEvent,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: "Internal server error" });
  }
});

// router.post('/reserve', async (req, res) => {
//   const { eventId, userId, seats } = req.body;
//   console.log({eventId, userId, seats})
//   try {
//     const event = await Event.findById(eventId);
//     if (!event) return res.status(404).send('Event not found');

//     // Update seat availability
//     const updatedSeats = seats.map(seat => {
//       const seatToUpdate = event.Seats.find(s => s.row === seat.row && s.number === seat.number);
//       if (seatToUpdate && seatToUpdate.isAvailable) {
//         seatToUpdate.isAvailable = false;
//         return seatToUpdate;
//       } else {
//         throw new Error(`Seat ${seat.row}-${seat.number} is already booked`);
//       }
//     });

//     // Save reservation
//     const reservation = new Reserve({
//       reserveDate: new Date(),
//       reserveUserID: userId,
//       reservedEventID: eventId,
//       SeatsDetails: seats,
//     });

//     await event.save();
//     await reservation.save();

//     res.status(200).json({ message: 'Reservation successful', seats: updatedSeats });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });
router.post('/reserve', async (req, res) => {
  // const { eventId, userId, seats } = req.body;
  // console.log('Request Body:', req.body);

  // try {
  //   const event = await Event.findById(eventId);
  //   if (!event) return res.status(404).send('Event not found');

  //   // Update seat availability
  //   const updatedSeats = seats.map(seat => {
  //     const seatToUpdate = event.Seats.find(s => s.row === seat.row && s.number === seat.number);
  //     if (seatToUpdate && seatToUpdate.isAvailable) {
  //       seatToUpdate.isAvailable = false;
  //       return seatToUpdate;
  //     } else {
  //       throw new Error(`Seat ${seat.row}-${seat.number} is already booked`);
  //     }
  //   });

  //   // Save reservation
  //   const reservation = new Reserve({
  //     reserveDate: new Date(),
  //     reserveUserID: userId,
  //     reservedEventID: eventId,
  //     SeatsDetails: seats,
  //   });

  //   await event.save();
  //   await reservation.save();

  //   res.status(200).json({ message: 'Reservation successful', seats: updatedSeats });
  // } catch (err) {
  //   res.status(500).json({ error: err.message });
  // }
  res.status(200).json({ message: 'Reservation successful', });

});

router.put("/", async (req, res) => {
  var {
    eventDate,
    eventName,
    eventDetails,
    eventType,
    genre,
    acitivityType,
    eventCategory,
    Rows,
    seatsPerRow,
  } = req.body;
  console.log(req.body);
  // eventType = eventType.toLowerCase();
  // acitivityType = acitivityType.toLowerCase();

  // if (
  //   !isDate(eventDate) ||
  //   !isEnglish(eventDetails) ||
  //   !isEnglish(eventName) ||
  //   // !isNumeric(Rows) ||
  //   // !isNumeric(seatsPerRow) ||
  //   !isNumeric(String(Rows)) ||
  // !isNumeric(String(seatsPerRow)) ||
  //   // !validator.isNumeric(Rows) ||  // Use validator.isNumeric directly
  //   // !validator.isNumeric(seatsPerRow) ||
  //   !isEnglish(genre) ||
  //   !isEnglish(eventCategory) ||
  //   !isEventType(eventType) ||
  //   !isActivityType(acitivityType)
  // )
  //   return res.status(400).json({ ok: false, msg: "check input" });

  console.log({ Rows, seatsPerRow });
  var seats = [];
  for (let i = 1; i <= Rows; i++) {
    for (let j = 1; j <= seatsPerRow; j++) {
      seats.push({
        row: i,
        number: j,
      });
    }
  }

  await Event.create({
    eventDate: eventDate,
    eventName: eventName,
    // eventAdmin: auth.user._id,
    eventDetails: eventDetails,
    Seats: seats,
  });
  // console.log(seats);
  return res.status(200).json({ ok: true, msg: "Event Added Successfully" });
});
module.exports = router;
