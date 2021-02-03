import { Server, Socket } from 'socket.io';
import express, { NextFunction, Request, Response } from 'express';

import { ServerLogger } from './logger';
import { authenticateConnection } from './realtime-middlewares';
import dotenv from 'dotenv';
import http from 'http';
import { matchPlayer } from './realtime-middlewares/games';
import mongoose from 'mongoose';
// connect to redis
import redis from 'redis';
import { registerRealtimeHandlers } from './realtime-handlers';
// Setup logging
import winston from 'winston';

require('./logger');
const logger = winston.loggers.get('server');

// Load environment variables
dotenv.config();

if (!process.env.JWT_SECRET) {
  throw Error('Environment variables not loaded.');
}

// connect to database
if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(process.env.MONGODB_CONN_STR!, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const db = mongoose.connection;
  db.on('error', () => {
    logger.error('Unable to connect to database.');
  });
  db.on('open', () => {
    logger.info('Connected to database.');
  });
}

export var redisClient: redis.RedisClient;
if (process.env.NODE_ENV !== 'test') {
  redisClient = redis.createClient({
    url: process.env.REDIS_CONN_STR,
  });
}

// configure express app
const app = express();
app.set('trust proxy', 1);
app.use(require('cors')());
app.get('/', (req, res) => {
  res.json({ version: 1 });
});
app.use('/api', require('./api'));

// 404 express error handler
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ error: 'This route is invalid.' });
});

// 500 express error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  ServerLogger.error(err);
  res.json({
    error: 'An unknown error occured.',
    errors: [
      {
        param: 'global',
        msg: 'An unknown error occured.',
      },
    ],
  });
});

const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

// Register socket.io middleware
io.use(authenticateConnection);
io.use(matchPlayer);

// On an incoming socket.io connection, register event handlers
io.on('connection', (socket: Socket) => {
  registerRealtimeHandlers(socket);
});

export default server;
