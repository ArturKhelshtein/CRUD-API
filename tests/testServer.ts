import http from 'node:http';
import { handler } from '../index.js';

export const createTestServer = () => {
  return http.createServer(handler);
};