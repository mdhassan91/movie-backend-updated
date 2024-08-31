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

// Define the GET route to fetch reservations by user ID
// router.get("/:userID", async (req, res) => {
//   const userID = req.params.userID;
//   console.log(userID);

//   try {
//     const reservations = await Reserve.find({ reserveUserID: userID });
//     res.status(200).json(reservations);
//   } catch (error) {
//     res
//       .status(500)
//       .json({ error: "An error occurred while fetching reservations" });
//   }
// });
// router.get('/:userID', async (req, res) => {
//   let userID = req.params.userID;
//   console.log(`Original userID: ${userID}`);
//   userID = userID.trim();
//   console.log(`Trimmed userID: ${userID}`);

//   try {
//     const reservations = await Reserve.find({ reserveUserID: userID });
//     console.log(`Reservations found: ${JSON.stringify(reservations)}`);

//     if (reservations.length === 0) {
//       return res.status(404).json({ message: 'No reservations found for this user ID' });
//     }
//     res.status(200).json(reservations);
//   } catch (error) {
//     console.error(`Error fetching reservations: ${error.message}`);
//     res.status(500).json({ error: 'An error occurred while fetching reservations' });
//   }
// });

router.get("/:userID", async (req, res) => {
  let userID = req.params.userID;
  console.log(`Original userID: ${userID}`);
  userID = userID.trim();
  console.log(`Trimmed userID: ${userID}`);

  try {
    const reservations = await Reserve.find({ reserveUserID: userID });
    if (reservations.length === 0) {
      return res
        .status(404)
        .json({ message: "No reservations found for this user ID" });
    }

    // Fetch event details for each reservation
    const detailedReservations = await Promise.all(
      reservations.map(async (reservation) => {
        const event = await Event.findById(reservation.reservedEventID);
        if (!event) {
          console.log(
            `Event not found for reservedEventID: ${reservation.reservedEventID}`
          );
          return null;
        }

        return {
          _id: reservation._id,
          reserveDate: reservation.reserveDate,
          eventName: event.eventName,
          eventCategory: event.eventCategory,
          eventDate: event.eventDate,
          eventTime:
            event.showtimes.length > 0 ? event.showtimes[0].showtimeDate : null,
          // quantity: reservation.SeatsDetails.length, // Assuming quantity is the length of SeatsDetails array
          SeatsDetails: reservation.SeatsDetails,
        };
      })
    );

    // Filter out null values in case some events were not found
    const filteredReservations = detailedReservations.filter(
      (reservation) => reservation !== null
    );

    res.status(200).json(filteredReservations);
  } catch (error) {
    console.error(`Error fetching reservations: ${error.message}`);
    res
      .status(500)
      .json({ error: "An error occurred while fetching reservations" });
  }
});

// Define the DELETE route to delete a reservation by ID

router.delete('/:reservationID', async (req, res) => {
  const reservationID = req.params.reservationID;

  try {
    // Find the reservation by ID
    const deletedReservation = await Reserve.findByIdAndDelete(reservationID);

    if (!deletedReservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Find the event associated with this reservation
    const event = await Event.findById(deletedReservation.reservedEventID);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Mark the reserved seats as available
    deletedReservation.SeatsDetails.forEach((seat) => {
      const seatToUpdate = event.Seats.find(
        (s) => s.row === seat.row && s.number === seat.number
      );
      if (seatToUpdate) {
        seatToUpdate.isAvailable = true;
        seatToUpdate.reserveID = null; // Remove the link to the user
      }
    });

    // Save the updated event
    await event.save();

    res.status(200).json({ message: 'Reservation deleted and seats updated successfully' });
  } catch (error) {
    console.error(`Error deleting reservation: ${error.message}`);
    res.status(500).json({ error: 'An error occurred while deleting the reservation' });
  }
});

router.delete("/:reservationID/:reserveSeatID", async (req, res) => {
  const { reservationID, reserveSeatID } = req.params;

  try {
    // Find the reservation by ID
    const reservation = await Reserve.findById(reservationID);

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    // Find the seat in the reservation that needs to be removed
    const seatIndex = reservation.SeatsDetails.findIndex(
      (seat) => seat.reserveSeatID.toString() === reserveSeatID.toString()
    );

    if (seatIndex === -1) {
      return res.status(404).json({ message: "Seat not found in reservation" });
    }

    // Get the seat details to update the event
    const seatDetails = reservation.SeatsDetails[seatIndex];

    // Remove the seat from the reservation
    reservation.SeatsDetails.splice(seatIndex, 1);

    // If no seats remain in the reservation, delete the entire reservation
    if (reservation.SeatsDetails.length === 0) {
      await Reserve.findByIdAndDelete(reservationID);
    } else {
      // Otherwise, save the updated reservation
      await reservation.save();
    }

    // Find the event associated with this reservation
    const event = await Event.findById(reservation.reservedEventID);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Update the specific seat's availability in the event
    const seatToUpdate = event.Seats.find(
      (s) => s._id.toString() === reserveSeatID.toString()
    );

    if (seatToUpdate) {
      seatToUpdate.isAvailable = true;
      seatToUpdate.reserveID = null; // Clear the reservation link
    }

    // Save the updated event
    await event.save();

    res
      .status(200)
      .json({
        message: "Seat removed from reservation and updated successfully",
      });
  } catch (error) {
    console.error(`Error deleting seat from reservation: ${error.message}`);
    res
      .status(500)
      .json({
        error: "An error occurred while deleting the seat from the reservation",
      });
  }
});

router.post("/", async (req, res) => {
  const { eventId, userId, seats, Firstname, reserveShowtime } = req.body;
  console.log("Request Body:", req.body);

  if (!eventId || !userId || !seats || !Array.isArray(seats)) {
    return res.status(400).send("Bad Request: Missing required fields");
  }

  try {
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).send("Event not found");

    // Update seat availability and collect updated seats
    const updatedSeats = seats.map((seat) => {
      const seatToUpdate = event.Seats.find(
        (s) => s.row === seat.row && s.number === seat.number
      );
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
      Firstname,
      reservedEventID: eventId,
      SeatsDetails: seats,
      reserveShowtime,
    });

    await event.save();
    await reservation.save();

    res
      .status(200)
      .json({ message: "Reservation successful", seats: updatedSeats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/event", async (req, res) => {
  const { eventId, userId, seats, Firstname } = req.body;
  console.log("Request Body:", req.body);

  if (!eventId || !userId || !seats || !Array.isArray(seats)) {
    console.log("Bad Request: Missing required fields");
    return res.status(400).send("Bad Request: Missing required fields");
  }

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      console.log("Event not found");
      return res.status(404).send("Event not found");
    }

    // Check if showtimes exist (if relevant to your app logic)
    if (!event.showtimes || !event.showtimes[0] || !event.showtimes[0].times) {
      console.log("Invalid showtimes data in event", event.showtimes);
      return res.status(400).json({ error: "Invalid showtimes data in event" });
    }

    // Update seat availability and collect updated seats
    const updatedSeats = seats.map((seat) => {
      const seatToUpdate = event.Seats.find(
        (s) => s.row === seat.row && s.number === seat.number
      );
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
      Firstname,
      reservedEventID: eventId,
      SeatsDetails: seats,
    });

    console.log("Saving event and reservation");
    await event.save();
    await reservation.save();

    res
      .status(200)
      .json({ message: "Reservation successful", seats: updatedSeats });
  } catch (err) {
    console.error("Error during reservation:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
