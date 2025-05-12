import { ServerResponse } from 'http';

export function sendResponse(res: ServerResponse, statusCode: number, body?: any) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    if (body) {
        res.end(JSON.stringify(body));
    } else {
        res.end();
    }
}
