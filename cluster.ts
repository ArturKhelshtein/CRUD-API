import http from 'node:http';
import process from 'node:process';
import cluster from 'node:cluster';
import os from 'node:os';
import 'dotenv/config';

import { handler } from './index.js';

const PORT = Number(process.env.PORT) || 4000;

const cpusCount: number = os.cpus().length;
console.log(`The total count of CPUs: ${cpusCount}`);

if (cluster.isPrimary) {
    console.log(`Primary started. Pid: ${process.pid}`);

    for (let i: number = 0; i < cpusCount - 1; i++) {
        cluster.fork({ WORKER_PORT: (PORT + i).toString() });
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker died! Pid: ${worker.process.pid}`);
        cluster.fork();
    });
}

if (cluster.isWorker) {
    const workerPort = Number(process.env.WORKER_PORT);

    const server = http.createServer(handler);

    server.listen(workerPort, () => {
        console.log(`Worker ${process.pid} is listening on port ${workerPort}`);
    });
}
