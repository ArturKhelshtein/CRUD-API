const http = require('node:http');
const { URL: URLParser } = require('url');
const { v4: uuidV4 } = require('uuid');

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

    if (req.method === 'GET' && url.pathname === '/api/users') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(users));
        return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Route not found' }));
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
