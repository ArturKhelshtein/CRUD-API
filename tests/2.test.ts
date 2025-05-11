import request from 'supertest';

import { createTestServer } from './testServer.js';

process.env.PORT = '7002';

const server = createTestServer();

describe('Bad requests', () => {
    const wrongUUID: string = '12345678';
    const wrongUserId: string = '00000000-0000-0000-0000-000000000000';

    beforeAll((done) => {
        server.listen(process.env.PORT, () => {
            done();
        });
    });

    afterAll((done) => {
        server.close(done);
    });

    it('GET /api/user go to wrong path should return route not found', async () => {
        const res = await request(server).get('/api/user');
        expect(res.statusCode).toBe(404);
    });

    it('GET /api/users/:id use wrong UUID should return it\s invalid UUID', async () => {
        const res = await request(server).get(`/api/users/${wrongUUID}`);
        expect(res.statusCode).toBe(400);
    });

    it('POST /api/users use incomplete data should return bad request', async () => {
        const user = {
            username: 'Artur',
        };

        const res = await request(server).post('/api/users').send(user);
        expect(res.statusCode).toBe(400);
    });

    it('PUT /api/users/:id use wrong UUID should return it\s invalid UUID', async () => {
        const update = {
            username: 'Artur',
            age: 30,
            hobbies: ['sleeping'],
        };
        const res = await request(server).put(`/api/users/${wrongUUID}`).send(update);
        expect(res.statusCode).toBe(400);
    });

    it('PUT /api/users/:id use wrong userId should return not found user', async () => {
        const update = {
            username: 'Artur',
            age: 30,
            hobbies: ['sleeping'],
        };
        const res = await request(server).put(`/api/users/${wrongUserId}`).send(update);
        expect(res.statusCode).toBe(404);
    });

    it('PUT /api/users/:id update with incomplete data should return bad request user', async () => {
        const user = {
            username: 'Artur',
            age: 36,
            hobbies: ['sleeping'],
        };

        const res1 = await request(server).post('/api/users').send(user);

        const createdUserId = res1.body.id;

        const update = {
            username: 'Artem',
        };

        const res = await request(server).put(`/api/users/${createdUserId}`).send(update);
        expect(res.statusCode).toBe(400);
    });

    it('DELETE /api/users/:id use wrong UUID should return it\s invalid UUID', async () => {
        const res = await request(server).delete(`/api/users/${wrongUUID}`);
        expect(res.statusCode).toBe(400);
    });

    it('DELETE /api/users/:id use wrong userId should return not found user', async () => {
        const res = await request(server).delete(`/api/users/${wrongUserId}`);
        expect(res.statusCode).toBe(404);
    });
});
