const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const User = require('../models/User');

describe('Auth Endpoints', () => {

    beforeAll(async () => {
        // Connect to a test database or clear the existing one if safe
        // For locally running, we might be using the main DB, so be careful.
        // In a real scenario, we use strictly test DB.
        // Here, I will just clean up the specific test user.
    });

    afterAll(async () => {
        await User.deleteMany({ email: 'test@example.com' });
        await mongoose.connection.close();
    });

    it('should register a new user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
    });

    it('should login the user', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@example.com',
                password: 'password123'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
    });
});
