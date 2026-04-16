const request = require('supertest');
const { app } = require('../app');

describe('Auth API', () => {
    test('GET / should return 200', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toEqual(200);
    });

    // We can add more tests for login, etc.
    // Note: Testing login requires a running DB or mocking the DB.
    // For now, we'll stick to basic connectivity tests.
});
