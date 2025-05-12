import http, { IncomingMessage, ServerResponse } from 'node:http';
import process from 'node:process';
import cluster from 'node:cluster';
import os from 'node:os';
import 'dotenv/config';

import { routes } from './src/routes';
import { IWorkerMessage, IPrimaryMessage } from './src/types/cluster.js';

const PORT = Number(process.env.PORT) || 4000;

if (cluster.isPrimary) {
    const cpusCount = os.cpus().length;
    const workersCount = cpusCount - 1;

    console.log(`The total count of CPUs: ${cpusCount}`);
    console.log(`Primary started. Pid: ${process.pid}`);

    for (let i: number = 1; i <= workersCount; i++) {
        const workerPort = PORT + i;
        cluster.fork({ WORKER_PORT: workerPort.toString() });
    }

    let currentWorker = 1;

    const loadBalancer = http.createServer((req: IncomingMessage, res: ServerResponse) => {
        const targetPort = PORT + currentWorker;

        const proxyReq = http.request(
            {
                hostname: 'localhost',
                port: targetPort,
                path: req.url,
                method: req.method,
                headers: req.headers,
            },
            proxyRes => {
                res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
                proxyRes.pipe(res, { end: true });
            }
        );

        proxyReq.on('error', err => {
            console.error(`Proxy request error: ${err.message}`);
            res.writeHead(502);
            res.end('Bad Gateway');
        });

        req.pipe(proxyReq, { end: true });

        currentWorker = currentWorker >= workersCount ? 1 : currentWorker + 1;
    });

    loadBalancer.listen(PORT, () => {
        console.log(`Load balancer running on port ${PORT}`);
    });

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker died! Pid: ${worker.process.pid}. Code: ${code}`);
        cluster.fork();
    });

    cluster.on('message', (worker, message: IWorkerMessage) => {
        if (message.type === 'request') {
            const { method, pathname, body } = message;

            const req = {
                method,
                url: pathname,
                on: (event: string, callback: Function) => {
                    if (event === 'data') {
                        callback(JSON.stringify(body));
                    }
                    if (event === 'end') {
                        callback();
                    }
                }
            };

            const res = {
                writeHead: (statusCode: number, headers: any) => {
                },
                end: (body: any) => {
                    let statusCode = 200;
                    if (method === 'POST') {
                        statusCode = 201;
                    } else if (method === 'DELETE') {
                        statusCode = 204;
                    }

                    worker.send({ 
                        type: 'response', 
                        statusCode, 
                        body: method === 'DELETE' ? null : body,
                        pathname: message.pathname
                    });
                },
            };

            routes(req as any, res as any);
        }
    });
}

if (cluster.isWorker) {
    const workerPort = Number(process.env.WORKER_PORT);
    const pendingResponses = new Map<string, ServerResponse>();

    if (isNaN(workerPort) || workerPort < 0 || workerPort >= 65536) {
        console.error(`Invalid worker port: ${process.env.WORKER_PORT}`);
        process.exit(1);
    }

    const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
        const pathname = req.url?.split('?')[0] || '';
        const method = req.method;

        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const parsedBody = body ? JSON.parse(body) : null;
                if (process.send) {
                    pendingResponses.set(pathname, res);

                    const message = {
                        type: 'request',
                        method,
                        pathname,
                        body: parsedBody,
                    };
                    process.send(message);
                }
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });

        req.on('error', error => {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal Server Error' }));
        });
    });

    process.on('message', (message: IPrimaryMessage) => {
        if (message.type === 'response') {
            const res = pendingResponses.get(message.pathname);
            if (res) {
                res.writeHead(message.statusCode, { 'Content-Type': 'application/json' });
                if (message.statusCode !== 204) {
                    const responseBody = typeof message.body === 'string' 
                        ? JSON.parse(message.body) 
                        : message.body;
                    res.end(JSON.stringify(responseBody, null, 2));
                } else {
                    res.end();
                }
                pendingResponses.delete(message.pathname);
            }
        }
    });

    server.listen(workerPort, () => {
        console.log(`Worker started. PID: ${process.pid} on port: ${workerPort}`);
    });

    ['SIGINT', 'SIGTERM', 'SIGUSR2'].forEach(signal => {
        process.on(signal, () => {
            console.log(`Signal ${signal}`);
            server.close(() => process.exit(signal === 'SIGUSR2' ? 1 : 0));
        });
    });
}
