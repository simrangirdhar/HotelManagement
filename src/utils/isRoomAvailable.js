const fs = require('fs-extra');

const BOOKINGS_DB = 'src/database/bookings.json';
const HOTELS_DB = 'src/database/hotels.json';


const isRoomAvailable = async (hotelId, checkIn, checkOut, requestedRooms) => {
    try {
        // Convert date strings to Date objects
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        if (isNaN(checkInDate) || isNaN(checkOutDate) || checkInDate >= checkOutDate) {
            throw new Error("Invalid date range.");
        }

        // Load hotel data
        const hotels = await fs.readJSON(HOTELS_DB);
        const hotel = hotels.find(h => h.id === String(hotelId));

        if (!hotel) {
            throw new Error("Hotel not found.");
        }

        // Load existing bookings
        const bookings = await fs.readJSON(BOOKINGS_DB);

        // Function to check room availability on a specific date
        const isAvailableOnDate = (date) => {
            let availableRooms = hotel.NoOfRoomsAvaiable;

            // Find active bookings overlapping with this date
            const activeBookings = bookings.filter(booking =>
                String(booking.hotelId) === String(hotelId) &&
                new Date(booking.checkIn) <= date &&
                new Date(booking.checkOut) > date
            );

            // Subtract booked rooms
            activeBookings.forEach(booking => {
                availableRooms = availableRooms-booking.rooms;
                console.log(availableRooms)
            });

            return availableRooms >= requestedRooms;
        };

        // Check for each day in the range
        for (let d = new Date(checkInDate); d < checkOutDate; d.setDate(d.getDate() + 1)) {
            if (!isAvailableOnDate(new Date(d))) {
                return false; // If any day is unavailable, return false
            }
        }

        return true; // If all days have enough rooms, return true
    } catch (error) {
        console.error("Error checking room availability:", error.message);
        throw error;
    }
};

module.exports=isRoomAvailable;


