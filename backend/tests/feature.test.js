const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const User = require('../models/User');

let token;

describe('Feature Endpoints', () => {

    beforeAll(async () => {
        // Create user and get token
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Feature Tester',
                email: 'feature@test.com',
                password: 'password123'
            });
        token = res.body.token;
    });

    afterAll(async () => {
        await User.deleteMany({ email: 'feature@test.com' });
        // Clean up flashcards?
        await mongoose.connection.close();
    });

    it('should create a flashcard with AI processing', async () => {
        const res = await request(app)
            .post('/api/flashcards')
            .set('x-auth-token', token)
            .send({
                front: 'Test Concept',
                rawText: 'This is a detailed explanation.',
                type: 'simplify'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('type', 'simplify');
        // Check if back content is generated (mock or real)
        // Since we didn't mock the AI service in this test file, it uses the "real" one which is currently a stub returning mock data.
    });

    it('should run code via compiler proxy', async () => {
        const res = await request(app)
            .post('/api/compiler/run')
            .set('x-auth-token', token)
            .send({
                language: 'python',
                code: 'print("Hello Test")'
            });

        expect(res.statusCode).toEqual(200);
        // Expecting our mock response or real response structure
        expect(res.body).toHaveProperty('stdout');
    });
});
