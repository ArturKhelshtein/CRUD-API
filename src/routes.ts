import { IncomingMessage, ServerResponse } from 'http';
import { controller } from './controller';

export const handleRoutes = async (req: IncomingMessage, res: ServerResponse) => {
    const pathname = req.url?.split('?')[0];
    const method = req.method;

    if (method === 'GET' && pathname === '/api/users') {
        controller.getAllUsers(req, res);
        return;
    }

    if (method === 'GET' && pathname?.startsWith('/api/users/')) {
        controller.getUserById(req, res);
        return;
    }

    if (method === 'POST' && pathname === '/api/users') {
        controller.postUser(req, res);
        return;
    }

    // if (method === 'PUT' && pathname?.startsWith('/api/users/')) {
    //     controller.updateUserById(req, res);
    //     return;
    // }

    if (method === 'DELETE' && pathname?.startsWith('/api/users/')) {
        controller.deleteUserById(req, res);
        return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Route not found' }));
};
