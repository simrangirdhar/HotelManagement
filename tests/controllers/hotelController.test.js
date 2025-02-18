const request = require('supertest');
const express = require('express');
const fs = require('fs-extra');
const hotelRoutes = require('../../src/routes/hotelRoutes'); 

jest.mock('fs-extra'); 

describe('GET /hotels', () => {
    let app;
    let mockHotels;

    beforeAll(() => {
        app = express();
        app.use(express.json()); 
        app.use('/hotels', hotelRoutes); 
    });

    beforeEach(() => {
        mockHotels = [
            { id: 1, name: "Hotel A", location: "New York" },
            { id: 2, name: "Hotel B", location: "Los Angeles" }
        ];
    });

    it('should return all hotels when no location filter is provided', async () => {
        fs.readJSON.mockResolvedValue(mockHotels);

        const response = await request(app).get('/hotels');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockHotels);
    });

    it('should return filtered hotels based on location query', async () => {
        fs.readJSON.mockResolvedValue(mockHotels);

        const response = await request(app).get('/hotels?location=New%20York');

        expect(response.status).toBe(200);
        expect(response.body).toEqual([{ id: 1, name: "Hotel A", location: "New York" }]);
    });

    it('should return case-insensitive filtered hotels based on location query', async () => {
        fs.readJSON.mockResolvedValue(mockHotels);

        const response = await request(app).get('/hotels?location=new%20york'); 

        expect(response.status).toBe(200);
        expect(response.body).toEqual([{ id: 1, name: "Hotel A", location: "New York" }]);
    });

    it('should return an empty array if no hotels match the location filter', async () => {
        fs.readJSON.mockResolvedValue(mockHotels);

        const response = await request(app).get('/hotels?location=Miami');

        expect(response.status).toBe(200);
        expect(response.body).toEqual([]); // No hotels match the location
    });

    it('should return a 500 error if reading hotels fails', async () => {
        fs.readJSON.mockRejectedValue(new Error('File read error'));

        const response = await request(app).get('/hotels');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Error retrieving hotels' });
    });
});
