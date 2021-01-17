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

// Warn in dev environment
if (process.env.NODE_ENV === 'test') {
  logger.warn('Strict token checking is disabled in test environment.')
}

const app = express();
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
