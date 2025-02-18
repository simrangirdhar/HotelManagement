const request = require('supertest');
const express = require('express');
const fs = require('fs-extra');
const bookingRoutes = require('../../src/routes/bookingRoutes'); 
const { v4: uuidv4 } = require('uuid');
const isRoomAvailable = require("../../src/utils/isRoomAvailable");  

jest.mock('fs-extra');
jest.mock('uuid', () => ({
    v4: jest.fn().mockReturnValue('fake-uuid'),
}));
jest.mock('../../src/utils/isRoomAvailable'); 

describe('Booking Routes', () => {
    let app;
    let mockBookings;

    beforeAll(() => {
        app = express();
        app.use(express.json());
        app.use('/bookings', bookingRoutes);
    });

    beforeEach(() => {
        mockBookings = [
            { id: '1',  checkIn: '2025-02-15', checkOut: '2025-02-17', rooms: 2 },
            { id: '2', checkIn: '2025-02-20', checkOut: '2025-02-22', rooms: 3 }
        ];
    });

    it('should create a new booking', async () => {
        fs.readJSON.mockResolvedValue(mockBookings);
        fs.writeJSON.mockResolvedValue(undefined);
        isRoomAvailable.mockResolvedValue(true);  

        const newBooking = { checkIn: '2025-03-01', checkOut: '2025-03-05', rooms: 2 };

        const response = await request(app).post('/bookings').send(newBooking);

        expect(response.status).toBe(201);
        expect(response.body).toEqual({ id: 'fake-uuid', ...newBooking });
        expect(fs.writeJSON).toHaveBeenCalled();
    });

    it('should return 404 if room is not available', async () => {
        fs.readJSON.mockResolvedValue(mockBookings);
        isRoomAvailable.mockResolvedValue(false);  

        const newBooking = { checkIn: '2025-03-01', checkOut: '2025-03-05', rooms: 10 };

        const response = await request(app).post('/bookings').send(newBooking);

        expect(response.status).toBe(404);  
        expect(response.body).toEqual({ message: '10 Room not avaiable for given date range' });
    });

    it('should retrieve all bookings', async () => {
        fs.readJSON.mockResolvedValue(mockBookings);

        const response = await request(app).get('/bookings');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockBookings);
    });

    it('should update a booking', async () => {
        fs.readJSON.mockResolvedValue(mockBookings);
        fs.writeJSON.mockResolvedValue(undefined);
        isRoomAvailable.mockResolvedValue(true);  

        const updatedBooking = { checkIn: '2025-02-16', checkOut: '2025-02-18', rooms: 2 };

        const response = await request(app).put('/bookings/1').send(updatedBooking);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ id: '1', ...updatedBooking });
    });

    it('should return 404 when booking is not found for update', async () => {
        fs.readJSON.mockResolvedValue(mockBookings);

        const updatedBooking = { checkIn: '2025-02-16', checkOut: '2025-02-18', rooms: 2 };
        const response = await request(app).put('/bookings/999').send(updatedBooking);

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: 'Booking not found' });
    });

    it('should delete a booking', async () => {
        fs.readJSON.mockResolvedValue(mockBookings);
        fs.writeJSON.mockResolvedValue(undefined);

        const response = await request(app).delete('/bookings/1');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Booking deleted' });
    });

    it('should return 404 if booking is not found for deletion', async () => {
        fs.readJSON.mockResolvedValue(mockBookings);

        const response = await request(app).delete('/bookings/999');  // Non-existing booking ID

        expect(response.status).toBe(404);  
        expect(response.body).toEqual({ message: 'Booking not found' });
    });
});
