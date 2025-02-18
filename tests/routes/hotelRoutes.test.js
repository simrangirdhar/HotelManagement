const request = require('supertest');
const express = require('express');
const fs = require('fs-extra');
const hotelRoutes = require('../../src/routes/hotelRoutes'); 

jest.mock('fs-extra'); 

describe('GET /hotels', () => {
    let app;

    beforeAll(() => {
        app = express();
        app.use(express.json()); 
        app.use('/hotels', hotelRoutes); 
    });

    it('should return all hotels when no location filter is provided', async () => {
        const mockHotels = [
            { id: 1, name: "Hotel A", location: "New York" },
            { id: 2, name: "Hotel B", location: "Los Angeles" }
        ];
        fs.readJSON.mockResolvedValue(mockHotels);

        const response = await request(app).get('/hotels');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockHotels);
    });

    it('should return filtered hotels based on location', async () => {
        const mockHotels = [
            { id: 1, name: "Hotel A", location: "New York" },
            { id: 2, name: "Hotel B", location: "Los Angeles" }
        ];
        fs.readJSON.mockResolvedValue(mockHotels);

        const response = await request(app).get('/hotels?location=new%20york');

        expect(response.status).toBe(200);
        expect(response.body).toEqual([{ id: 1, name: "Hotel A", location: "New York" }]);
    });

    it('should return a 500 error if reading hotels fails', async () => {
        fs.readJSON.mockRejectedValue(new Error('File read error'));

        const response = await request(app).get('/hotels');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Error retrieving hotels' });
    });
});
