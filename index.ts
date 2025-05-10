const http = require('node:http');

const server = http.createServer((_req: any, res: { end: () => void; }) => {
    console.log('server work')
  res.end();
});
server.on('clientError', (_err: any, socket: { end: () => void; }) => {
    console.log('HTTP/1.1 400 Bad Request\r\n\r\n');
    socket.end();
});
server.listen(8000);