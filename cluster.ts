import http, { IncomingMessage, ServerResponse } from 'node:http';
import process from 'node:process';
import cluster from 'node:cluster';
import os from 'node:os';
import 'dotenv/config';

import { routes } from './src/routes.js';
import { handler } from './index.js';

const PORT = Number(process.env.PORT) || 4000;

if (cluster.isPrimary) {
    const cpusCount: number = os.cpus().length;
    console.log(`The total count of CPUs: ${cpusCount}`);
    console.log(`Primary started. Pid: ${process.pid}`);

    for (let i: number = 1; i < cpusCount; i++) {
        const workerPort = PORT + i;
        cluster.fork({ WORKER_PORT: workerPort.toString() });
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker died! Pid: ${worker.process.pid}. Code: ${code}`);
        cluster.fork();
    });
}

if (cluster.isWorker) {
    const workerPort = Number(process.env.WORKER_PORT);
    console.log('worker'+ workerPort)
    
    if (isNaN(workerPort) || workerPort < 0 || workerPort >= 65536) {
        console.error(`Invalid worker port: ${process.env.WORKER_PORT}`);
        process.exit(1);
    }

    const server = http.createServer(handler);

    server.listen(workerPort, () => {
        console.log(`Worker started. Pid: ${process.pid} on port: ${workerPort}`);
    });

    process.on('SIGINT', () => {
        console.log('Signal SIGINT');
        server.close(() => process.exit(0));
    });

    process.on('SIGTERM', () => {
        console.log('Signal SIGTERM');
        server.close(() => process.exit(0));
    });

    process.on('SIGUSR2', () => {
        console.log('Signal SIGUSR2');
        server.close(() => process.exit(1));
    });
}
