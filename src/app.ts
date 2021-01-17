import { Server, Socket } from 'socket.io';

import express from 'express';
import http from 'http';

const app = express();
const server = http.createServer(app);
const options = {
  cors: {
    origin: '*'
  }
};
const io = new Server(server, options);

io.on('connection', (socket: Socket) => {
  console.log(socket.id);
  socket.emit('hello', {success: true})
});

io.on('ping', (socket: Socket) => {
  socket.emit('pong');
})

export default server;