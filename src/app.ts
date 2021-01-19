import express from 'express';
import http from 'http';
import dotenv from 'dotenv';

import { registerRealtimeHandlers } from './realtime-handlers';
import { Server, Socket } from 'socket.io';
import { authenticateConnection } from './realtime-middlewares'

import winston from 'winston';
require('./logger');
const logger = winston.loggers.get('server');

// Load environment variables
dotenv.config()

// configure express app
const app = express();
app.get('/', (req, res) => {
  res.json({ version: 1 })
})
app.use('/api', require('./api'));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

// Register socket.io middleware
io.use(authenticateConnection)

// On an incoming socket.io connection, register event handlers
io.on('connection', (socket: Socket) => {
  registerRealtimeHandlers(socket);
});

export default server;
