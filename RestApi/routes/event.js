var express = require("express");
const Event = require("../model/event");
const { auth } = require("../middleware/auth");
const User = require("../model/user");

var router = express.Router();

router.get("/", auth, async (req, res) => {
  const { all } = req.body;
  //TODO validate req.body
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
  //TODO validate req.body
  Event.findOneAndDelete({ _id: eventID, eventAdmin: req.user._id });
  return res.status(200).json({ ok: true, msg: "event deleted" });
});
router.post("/", auth, async (req, res) => {
  const { eventID, eventDate, eventDetails, Rows, seatsPerRow } = req.body;
  //TODO validate req.body
  var seats = [];
  for (let i = 1; i < Rows; i++) {
    for (let j = 1; j < seatsPerRow; j++) {
      seats.push({
        row: i,
        number: j,
      });
    }
  }
  await Event.findOneAndUpdate(
    { eventAdmin: req.user._id, _id: eventID },
    {
      eventDate,
      eventDetails,
      seats,
    }
  );
  return res.status(200).json({ ok: true, msg: "event edited successfully" });
});
router.put("/", auth, async (req, res) => {
  const { eventDate, eventName, eventDetails, Rows, seatsPerRow } = req.body;
  //TODO validate req.body

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
