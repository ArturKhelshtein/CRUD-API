import http, { IncomingMessage, ServerResponse } from 'node:http';
import process from 'node:process';
import { routes } from './src/routes.js';
import 'dotenv/config';

const { PORT = 4000 } = process.env;

const handler = (req: IncomingMessage, res: ServerResponse) => {
    routes(req, res);
};

if (process.env.NODE_ENV !== 'test') {
    const server = http.createServer(handler);

    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

export { handler };
