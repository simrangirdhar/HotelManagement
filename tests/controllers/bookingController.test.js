const { createBooking, getBookings, updateBooking, deleteBooking } = require('../../src/controllers/bookingController');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const isRoomAvailable = require('../../src/utils/isRoomAvailable');

jest.mock('fs-extra');
jest.mock('uuid', () => ({ v4: jest.fn().mockReturnValue('fake-uuid') }));
jest.mock('../../src/utils/isRoomAvailable');

describe('Booking Controller', () => {
    let mockBookings;
    const BOOKINGS_DB = 'src/database/bookings.json';

    beforeEach(() => {
        mockBookings = [
            { id: '1', checkIn: '2025-02-15', checkOut: '2025-02-17', rooms: 2 },
            { id: '2', checkIn: '2025-02-20', checkOut: '2025-02-22', rooms: 3 }
        ];
    });

    it('should create a new booking if room is available', async () => {
        fs.readJSON.mockResolvedValue(mockBookings);
        fs.writeJSON.mockResolvedValue(undefined);
        isRoomAvailable.mockResolvedValue(true);

        const req = { body: { checkIn: '2025-03-01', checkOut: '2025-03-05', rooms: 2 } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        await createBooking(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should return 404 if room is not available when creating a booking', async () => {
        fs.readJSON.mockResolvedValue(mockBookings);
        isRoomAvailable.mockResolvedValue(false);

        const req = { body: {checkIn: '2025-03-01', checkOut: '2025-03-05', rooms: 10 } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        await createBooking(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: '10 Room not avaiable for given date range' });
    });

    it('should get all bookings', async () => {
        fs.readJSON.mockResolvedValue(mockBookings);

        const req = {};
        const res = { json: jest.fn() };

        await getBookings(req, res);

        expect(res.json).toHaveBeenCalledWith(mockBookings);
    });

    it('should update a booking if room is available', async () => {
        fs.readJSON.mockResolvedValue(mockBookings);
        fs.writeJSON.mockResolvedValue(undefined);
        isRoomAvailable.mockResolvedValue(true);

        const req = { params: { id: '1' }, body: { checkIn: '2025-02-16', checkOut: '2025-02-18', rooms: 2 } };
        const res = { json: jest.fn() };

        await updateBooking(req, res);

        expect(res.json).toHaveBeenCalledWith({ id: '1', checkIn: '2025-02-16', checkOut: '2025-02-18', rooms: 2 });
    });

    it('should return 404 when booking not found for update', async () => {
        fs.readJSON.mockResolvedValue(mockBookings);

        const req = { params: { id: '999' }, body: { checkIn: '2025-02-16', checkOut: '2025-02-18', rooms: 2 } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        await updateBooking(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Booking not found' });
    });

    it('should delete a booking', async () => {
        fs.readJSON.mockResolvedValue(mockBookings);
        fs.writeJSON.mockResolvedValue(undefined);

        const req = { params: { id: '1' } };
        const res = { json: jest.fn() };

        await deleteBooking(req, res);

        expect(res.json).toHaveBeenCalledWith({ message: 'Booking deleted' });
    });

    it('should return 404 if booking is not found for deletion', async () => {
        fs.readJSON.mockResolvedValue(mockBookings);

        const req = { params: { id: '999' } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        await deleteBooking(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Booking not found' });
    });
});
