var express = require("express");
const Reserve = require("../model/reserve"); // Adjust the path as necessary
const Event = require("../model/event");

var router = express.Router();

router.get("/", async (req, res) => {
  return res
    .status(200)
    .json({ ok: true, message: "Welcom to this Gandu World" });
});

// router.post("/", async (req, res) => {
//   const { eventId, userId, seats } = req.body;
//   console.log('Request Body:', req.body);


//     res.status(200).json({ message: 'Reservation successful', });

//   });

router.post('/', async (req, res) => {
    const { eventId, userId, seats } = req.body;
    console.log('Request Body:', req.body);
  
    if (!eventId || !userId || !seats || !Array.isArray(seats)) {
      return res.status(400).send('Bad Request: Missing required fields');
    }
  
    try {
      const event = await Event.findById(eventId);
      if (!event) return res.status(404).send('Event not found');
  
      // Update seat availability and collect updated seats
      const updatedSeats = seats.map(seat => {
        const seatToUpdate = event.Seats.find(s => s.row === seat.row && s.number === seat.number);
        if (seatToUpdate && seatToUpdate.isAvailable) {
          seatToUpdate.isAvailable = false;
          seatToUpdate.reserveID = userId; // Link the seat to the user
          return seatToUpdate;
        } else {
          throw new Error(`Seat ${seat.row}-${seat.number} is already booked`);
        }
      });
  
      // Save reservation
      const reservation = new Reserve({
        reserveDate: new Date(),
        reserveUserID: userId,
        reservedEventID: eventId,
        SeatsDetails: seats,
      });
  
      await event.save();
      await reservation.save();
  
      res.status(200).json({ message: 'Reservation successful', seats: updatedSeats });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

module.exports = router;
