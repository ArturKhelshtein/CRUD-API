import { IncomingMessage, ServerResponse } from 'http';
import { service } from './service';
import { validate as validateUuid } from 'uuid';

export const controller = {
    getAllUsers(req: IncomingMessage, res: ServerResponse) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(service.getAllUsers()));
    },

    getUserById(req: IncomingMessage, res: ServerResponse, userId: string) {
        if (!validateUuid(userId)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Invalid UUID' }));
            return;
        }

        const user = service.getUserById(userId);
        if (!user) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'User not found' }));
            return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(user));
    }
}; 