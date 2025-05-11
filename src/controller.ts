import { IncomingMessage, ServerResponse } from 'http';
import { service } from './service';
import { v4 as uuidV4, validate as validateUuid } from 'uuid';

const httpStatus = {
    OK: 200,
    CREATED: 201,
    DELETED: 204,
    BAD_REQUEST: 400,
    NOT_FOUND: 404
}

export const controller = {
    getAllUsers(req: IncomingMessage, res: ServerResponse) {
        res.writeHead(httpStatus.OK, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(service.getAllUsers()));
    },

    getUserById(req: IncomingMessage, res: ServerResponse) {
        const userId = getUserIdByReq(req);

        if (!userId || !validateUuid(userId)) {
            responseInvalidUUID(res);
            return;
        }

        const user = service.getUserById(userId!);

        if (!user) {
            responseNotFoundUser(res);
            return;
        }

        res.writeHead(httpStatus.OK, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(user));
        return;
    },

    async postUser(req: IncomingMessage, res: ServerResponse) {
        try {
            const body = (await getRequestBody(req)) as { username: string; age: number; hobbies?: string[] };
            const { username, age, hobbies = [] } = body;

            const isValid =
                typeof username === 'string' &&
                typeof age === 'number' &&
                Array.isArray(hobbies) &&
                hobbies.every(hobby => typeof hobby === 'string');

            if (!isValid) {
                res.writeHead(httpStatus.BAD_REQUEST, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Invalid user data' }));
                return;
            }

            const newUser = {
                id: uuidV4(),
                username,
                age,
                hobbies,
            };

            service.postUser(newUser);

            res.writeHead(httpStatus.CREATED, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(newUser));
            return;
        } catch {
            res.writeHead(httpStatus.BAD_REQUEST, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Invalid JSON body' }));
            return;
        }
    },

    deleteUserById(req: IncomingMessage, res: ServerResponse) {
        const userId = getUserIdByReq(req);

        if (!userId || !validateUuid(userId)) {
            responseInvalidUUID(res);
            return;
        }

        const isUserDeleted = service.deleteUser(userId!);

        if (!isUserDeleted) {
            responseNotFoundUser(res);
            return;
        }

        res.writeHead(httpStatus.DELETED, { 'Content-Type': 'application/json' });
        res.end();
        return;
    },
};

function getUserIdByReq(req: IncomingMessage) {
    return req.url?.split('?')[0].split('/').pop();
}

function responseInvalidUUID(res: ServerResponse) {
    res.writeHead(httpStatus.BAD_REQUEST, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Invalid UUID' }));
}

function responseNotFoundUser(res: ServerResponse) {
    res.writeHead(httpStatus.NOT_FOUND, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'User not found' }));
}

function getRequestBody(req: IncomingMessage) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', (chunk: string) => (body += chunk));
        req.on('error', () => {
            reject(new Error('Error reading request body'));
        });
        req.on('end', () => {
            try {
                const json = JSON.parse(body);
                resolve(json);
            } catch {
                reject(new Error('Invalid JSON'));
            }
        });
    });
}
