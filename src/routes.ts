import { IncomingMessage, ServerResponse } from 'http';
import { controller } from './controller';

export const handleRoutes = (req: IncomingMessage, res: ServerResponse) => {
    const pathname = req.url?.split('?')[0];
    const method = req.method;

    if (method === 'GET' && pathname === '/api/users') {
        controller.getAllUsers(req, res);
        return;
    }

    if (method === 'GET' && pathname?.startsWith('/api/users/')) {
        const userId = pathname.split('/').pop();
        if (userId) {
            controller.getUserById(req, res, userId);
        }
        return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Route not found' }));
}; 