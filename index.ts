const http = require('node:http');
const { URL: URLParser } = require('url');
const { v4: uuidV4, validate: validateUuid} = require('uuid');

const { PORT = 8000 } = process.env;

interface IUser {
    id: string;
    username: string;
    age: number;
    hobbies: string[];
}

const users : IUser[] = [];

const server = http.createServer((req: any, res: any) => {
    const url = new URLParser(req.url || '', `http://${req.headers.host}`);
    const pathname = url.pathname;
    const method = req.method;

    if (method === 'GET' && pathname === '/api/users') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(users));
        return;
    }

    if (method === 'GET' && pathname?.startsWith('/api/users/')) {
        const userId = pathname.split('/').pop();

        if (!validateUuid(userId)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Invalid UUID' }));
            return;
        }

        const user = users.find(user => user.id === userId);

        if (!user) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'User not found' }));
            return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(user));
        return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Route not found' }));
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
