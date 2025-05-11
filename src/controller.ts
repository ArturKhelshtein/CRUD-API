import { IncomingMessage, ServerResponse } from 'http';
import { service } from './service';
import { v4 as uuidV4, validate as validateUuid } from 'uuid';

const httpStatus = {
    OK: 200,
    CREATED: 201,
    DELETED: 204,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
};

const httpMessages = {
    INVALID_DATA: 'Invalid user data',
    INVALID_JSON: 'Invalid JSON body',
    INVALID_UUID: 'Invalid UUID',
    USER_NOT_FOUND: 'User not found',
};

export const controller = {
    getAllUsers(req: IncomingMessage, res: ServerResponse) {
        sendResponse(res, httpStatus.OK, service.getAllUsers());
    },

    getUserById(req: IncomingMessage, res: ServerResponse) {
        const userId = getUserIdByReq(req);

        if (!userId || !validateUuid(userId)) {
            sendResponse(res, httpStatus.BAD_REQUEST, httpMessages.INVALID_UUID);
            return;
        }

        const user = service.getUserById(userId!);

        if (!user) {
            sendResponse(res, httpStatus.NOT_FOUND, httpMessages.USER_NOT_FOUND);
            return;
        }

        sendResponse(res, httpStatus.OK, user);
        return;
    },

    async postUser(req: IncomingMessage, res: ServerResponse) {
        try {
            const body = (await getRequestBody(req)) as { username: string; age: number; hobbies: string[] };
            const { username, age, hobbies = [] } = body;

            if (!isValidUser(username, age, hobbies)) {
                sendResponse(res, httpStatus.BAD_REQUEST, httpMessages.INVALID_DATA);
                return;
            }

            const newUser = {
                id: uuidV4(),
                username,
                age,
                hobbies,
            };

            service.postUser(newUser);

            sendResponse(res, httpStatus.CREATED, newUser);
            return;
        } catch {
            sendResponse(res, httpStatus.BAD_REQUEST, httpMessages.INVALID_JSON);
            return;
        }
    },

    async updateUserById(req: IncomingMessage, res: ServerResponse) {
        const userId = getUserIdByReq(req);

        if (!userId || !validateUuid(userId)) {
            sendResponse(res, httpStatus.BAD_REQUEST, httpMessages.INVALID_UUID);
            return;
        }
        const user = service.getUserById(userId!);

        if (!user) {
            sendResponse(res, httpStatus.NOT_FOUND, httpMessages.USER_NOT_FOUND);
            return;
        }

        try {
            console.log(5)
            const body = (await getRequestBody(req)) as { username: string; age: number; hobbies: string[] };
            const { username, age, hobbies = [] } = body;

            if (!isValidUser(username, age, hobbies)) {
                sendResponse(res, httpStatus.BAD_REQUEST, httpMessages.INVALID_DATA);
                return;
            }

            const updateUser = {
                id: userId,
                username,
                age,
                hobbies,
            };

            service.updateUser(updateUser);
            sendResponse(res, httpStatus.OK, updateUser);
            return;
        } catch (error) {
            sendResponse(res, httpStatus.BAD_REQUEST, httpMessages.INVALID_JSON);
            return;
        }
    },

    deleteUserById(req: IncomingMessage, res: ServerResponse) {
        const userId = getUserIdByReq(req);

        if (!userId || !validateUuid(userId)) {
            sendResponse(res, httpStatus.BAD_REQUEST, httpMessages.INVALID_UUID);
            return;
        }

        const isUserDeleted = service.deleteUser(userId!);

        if (!isUserDeleted) {
            sendResponse(res, httpStatus.NOT_FOUND, httpMessages.USER_NOT_FOUND);
            return;
        }

        sendResponse(res, httpStatus.DELETED);
        return;
    },
};

function isValidUser(username: string, age: number, hobbies: string[]) {
    if (
        typeof username === 'string' &&
        typeof age === 'number' &&
        Array.isArray(hobbies) &&
        hobbies.every(hobby => typeof hobby === 'string')
    ) {
        return true;
    }
    return false;
}

function sendResponse(res: ServerResponse, statusCode: number, body?: any) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    if (body) {
        res.end(JSON.stringify(body));
    } else {
        res.end();
    }
}

function getUserIdByReq(req: IncomingMessage) {
    return req.url?.split('?')[0].split('/').pop();
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
