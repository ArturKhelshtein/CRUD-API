import request from 'supertest';

import { createTestServer } from './testServer.js';

process.env.PORT = '7001';

const server = createTestServer();

describe('User API', () => {
    let createdUserId: string;

    beforeAll((done) => {
        server.listen(process.env.PORT, () => {
            done();
        });
    });

    afterAll((done) => {
        server.close(done);
    });

    it('GET /api/users should return an empty array', async () => {
        const res = await request(server).get('/api/users');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([]);
    });

    it('POST /api/users should return a created user', async () => {
        const user = {
            username: 'Artur',
            age: 36,
            hobbies: ['sleeping'],
        };

        const res = await request(server).post('/api/users').send(user);
        expect(res.statusCode).toBe(201);
        expect(res.body).toMatchObject(user);
        expect(res.body.id).toBeDefined();

        createdUserId = res.body.id;
    });

    it('GET /api/users/:id should return the created user', async () => {
        const res = await request(server).get(`/api/users/${createdUserId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.id).toBe(createdUserId);
    });

    it('PUT /api/users/:id should update the user', async () => {
        const update = {
            username: 'Artur',
            age: 30,
            hobbies: ['sleeping'],
        };
        const res = await request(server).put(`/api/users/${createdUserId}`).send(update);
        expect(res.statusCode).toBe(200);
        expect(res.body.age).toBe(30);
    });

    it('DELETE /api/users/:id should delete the user', async () => {
        const res = await request(server).delete(`/api/users/${createdUserId}`);
        expect(res.statusCode).toBe(204);
    });

    it('GET /api/users/:id after delete should return 404', async () => {
        const res = await request(server).get(`/api/users/${createdUserId}`);
        expect(res.statusCode).toBe(404);
    });
});
