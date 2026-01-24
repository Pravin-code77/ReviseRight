const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');

describe('Server Setup', () => {

    afterAll(async () => {
        await mongoose.connection.close();
    });

    it('should return welcome message', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'ReviseRight API is running');
    });
});
