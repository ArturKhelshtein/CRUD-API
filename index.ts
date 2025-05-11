import http, { IncomingMessage, ServerResponse } from 'node:http';
import process from 'node:process';
import { routes } from './src/routes.js';
import 'dotenv/config'

const { PORT = 8000 } = process.env;

const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
    routes(req, res);
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
