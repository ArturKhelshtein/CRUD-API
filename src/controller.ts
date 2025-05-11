import { IncomingMessage, ServerResponse } from 'http';
import { service } from './service';
import { v4 as uuidV4, validate as validateUuid } from 'uuid';

export const controller = {
    getAllUsers(req: IncomingMessage, res: ServerResponse) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(service.getAllUsers()));
    },

    getUserById(req: IncomingMessage, res: ServerResponse) {
        const userId = req.url?.split('?')[0].split('/').pop();

        if (!userId || !validateUuid(userId)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Invalid UUID' }));
            return;
        }

        const user = service.getUserById(userId);
        if (!user) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'User not found' }));
            return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(user));
        return;
    },

    async postUser(req: IncomingMessage, res: ServerResponse) {
        try {
            const body = await getRequestBody(req) as { username: string; age: number; hobbies?: string[] };
            const { username, age, hobbies = [] } = body;

            const isValid =
                typeof username === 'string' &&
                typeof age === 'number' &&
                (hobbies === undefined || (Array.isArray(hobbies) && hobbies.every(hobby => typeof hobby === 'string')));

            if (!isValid) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
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

            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(newUser));
            return;
        } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Invalid JSON body' }));
            return;
        }
    }
}; 

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
        } catch (error) {
          reject(new Error('Invalid JSON'));
        }
      });
    });
  }