import http from 'node:http';
import { handleRoutes } from './src/routes.js';

const { PORT = 8000 } = process.env;

const server = http.createServer((req: any, res: any) => {
    handleRoutes(req, res);
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
