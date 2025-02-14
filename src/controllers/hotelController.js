const fs = require('fs-extra');
const HOTELS_DB = 'src/database/hotels.json';

exports.getHotels = async (req, res) => {
    try {
        const { location } = req.query;
        let hotels = await fs.readJSON(HOTELS_DB);

        if (location) {
            hotels = hotels.filter(hotel => hotel.location.toLowerCase() === location.toLowerCase());
        }

        res.json(hotels);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving hotels' });
    }
};
