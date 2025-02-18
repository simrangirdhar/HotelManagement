const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const BOOKINGS_DB = 'src/database/bookings.json';
const isRoomAvailable = require("../utils/isRoomAvailable");

exports.createBooking = async (req, res) => {
    try {
        const { hotelId, checkIn, checkOut, rooms } = req.body;
        let bookings = await fs.readJSON(BOOKINGS_DB);
        const isAvailable = await isRoomAvailable(hotelId, checkIn, checkOut, rooms);

        if (isAvailable) {
            const newBooking = { id: uuidv4(), hotelId, checkIn, checkOut, rooms };
            bookings.push(newBooking);

            await fs.writeJSON(BOOKINGS_DB, bookings, { spaces: 2 });
            res.status(201).json(newBooking);
        } else {
            res.status(404).json({ message: `${rooms} Room not avaiable for given date range` });
        }
    } catch (error) {
        console.error('Error in createBooking:', error); // Logging error for debugging
        res.status(500).json({ message: 'Error creating booking', error: error.message });
    }
};

exports.getBookings = async (req, res) => {
    try {
        const bookings = await fs.readJSON(BOOKINGS_DB);
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving bookings' });
    }
};

exports.updateBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const { checkIn, checkOut, rooms } = req.body;
        let bookings = await fs.readJSON(BOOKINGS_DB);

        const bookingIndex = bookings.findIndex(b => b.id === id);
        if (bookingIndex === -1) return res.status(404).json({ message: 'Booking not found' });

        const isAvailable = await isRoomAvailable(bookings[bookingIndex].hotelId, checkIn, checkOut, rooms);
        if (isAvailable) {
            bookings[bookingIndex] = { ...bookings[bookingIndex], checkIn, checkOut, rooms };
            await fs.writeJSON(BOOKINGS_DB, bookings, { spaces: 2 });

            res.json(bookings[bookingIndex]);
        } else {
            res.status(500).json({ message: 'Cannot update the booking with this details' });
        }
    } catch (error) {
        console.error('Error in updateBooking:', error);  // Logging error for debugging
        res.status(500).json({ message: 'Error updating booking' });
    }
};

exports.deleteBooking = async (req, res) => {
    try {
        const { id } = req.params;
        let bookings = await fs.readJSON(BOOKINGS_DB);

        const bookingIndex = bookings.findIndex(b => b.id === id);
        if (bookingIndex === -1) return res.status(404).json({ message: 'Booking not found' });

        const updatedBookings = bookings.filter(b => b.id !== id);
        await fs.writeJSON(BOOKINGS_DB, updatedBookings, { spaces: 2 });

        res.json({ message: 'Booking deleted' });
    } catch (error) {
        console.error('Error in deleteBooking:', error);  // Logging error for debugging
        res.status(500).json({ message: 'Error deleting booking' });
    }
};
