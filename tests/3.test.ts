import request from 'supertest';

import { createTestServer } from './testServer.js';
import { httpMessages } from '../src/constants.js';

process.env.PORT = '7003';

const server = createTestServer();

describe('User Deletion Flow', () => {
    let userId: string;

    beforeAll(done => {
        server.listen(process.env.PORT, () => {
            done();
        });
    });

    afterAll(done => {
        server.close(done);
    });

    it('POST /api/users should return a created user', async () => {
        const user = {
            username: 'ToDelete',
            age: 99,
            hobbies: ['hiking'],
        };

        const res = await request(server).post('/api/users').send(user);

        expect(res.statusCode).toBe(201);
        expect(res.body).toMatchObject(user);
        expect(res.body.id).toBeDefined();

        userId = res.body.id;
    });

    it('DELETE /api/users/:id should delete the user', async () => {
        const res = await request(server).delete(`/api/users/${userId}`);
        expect(res.statusCode).toBe(204);
    });

    it('DELETE /api/users/:id second delete should return 404', async () => {
        const res = await request(server).delete(`/api/users/${userId}`);
        expect(res.statusCode).toBe(404);
    });

    it('GET /api/users/:id after delete should return 404', async () => {
        const res = await request(server).get(`/api/users/${userId}`);
        expect(res.statusCode).toBe(404);
    });
});
