var express = require("express");
const Event = require("../model/event");
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
  const { all } = req.body;
  if (typeof all != Boolean)
    return res.status(400).json({ ok: false, msg: "check input" });

  var data;
  if (all) {
    data = Event.find({});
  } else {
    data = Event.find({ eventAdmin: req.user._id });
  }

  return res.status(200).json({ ok: true, data: data });
});
router.delete("/", auth, async (req, res) => {
  const { eventID } = req.body;

  var event = Event.findOneAndDelete(
    {
      _id: eventID,
      eventAdmin: req.user._id,
    },
    { new: true }
  );
  if (event) return res.status(200).json({ ok: true, msg: "event deleted" });
  return res.status(404).json({ ok: false, msg: "event not fount" });
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
    { eventAdmin: req.user._id, _id: eventID },
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
router.put("/", auth, async (req, res) => {
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
  eventType = eventType.toLowerCase();
  acitivityType = acitivityType.toLowerCase();

  if (
    !isDate(eventDate) ||
    !isEnglish(eventDetails) ||
    !isEnglish(eventName) ||
    !isNumeric(Rows) ||
    !isNumeric(seatsPerRow) ||
    !isEnglish(genre) ||
    !isEnglish(eventCategory) ||
    !isEventType(eventType) ||
    !isActivityType(acitivityType)
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
  await Event.create({
    eventDate: eventDate,
    eventName: eventName,
    eventAdmin: auth.user._id,
    eventDetails: eventDetails,
    Seats: seats,
  });
  return res.status(200).json({ ok: true, msg: "Event Added Successfully" });
});
module.exports = router;
