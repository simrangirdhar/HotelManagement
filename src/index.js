const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const hotelRoutes = require('./routes/hotelRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

app.use('/hotels', hotelRoutes);
app.use('/bookings', bookingRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
