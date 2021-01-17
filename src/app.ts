import { Server, Socket } from 'socket.io';

import express from 'express';
import http from 'http';

import { registerRealtimeHandlers } from './realtime-handlers';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

// On an incoming socket.io connection, register event handlers
io.on('connection', (socket: Socket) => {
  registerRealtimeHandlers(socket);
});

export default server;
