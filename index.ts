import http, { IncomingMessage, ServerResponse } from 'node:http';
import process from 'node:process';
import { handleRoutes } from './src/routes.js';

const { PORT = 8000 } = process.env;

const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
    handleRoutes(req, res);
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
