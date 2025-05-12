import http, { IncomingMessage, ServerResponse } from 'node:http';
import process from 'node:process';
import cluster from 'node:cluster';
import os from 'node:os';
import 'dotenv/config';

import { handler } from './index.js';

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

        proxyReq.on('error', (err) => {
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
}

if (cluster.isWorker) {
    const workerPort = Number(process.env.WORKER_PORT);

    if (isNaN(workerPort) || workerPort < 0 || workerPort >= 65536) {
        console.error(`Invalid worker port: ${process.env.WORKER_PORT}`);
        process.exit(1);
    }

    const server = http.createServer(handler);

    server.listen(workerPort, () => {
        console.log(`Worker started. Pid: ${process.pid} on port: ${workerPort}`);
    });

    ['SIGINT', 'SIGTERM', 'SIGUSR2'].forEach(signal => {
        process.on(signal, () => {
            console.log(`Signal ${signal}`);
            server.close(() => process.exit(signal === 'SIGUSR2' ? 1 : 0));
        });
    });
}
