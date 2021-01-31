import {
  GameStatus,
  IGameStatusData,
  IGameUpdateData,
  IMessageEventData,
} from './types';

import _ from 'lodash';
import dotenv from 'dotenv';
import { generateAnonymousToken } from '../api/getAnonymousToken';
import io from 'socket.io-client';
import { setTimeout } from 'timers';
import winston from 'winston';

require('../logger'); // setup logger
const logger = winston.loggers.get('client');

// setup env vars
dotenv.config();

// Constants
const BACKEND_URL = 'http://localhost:5000';

// Socket.io config
const socket = io(BACKEND_URL, {
  query: {
    gameID: 'hello',
  },
  // @ts-ignore
  auth: {
    token: generateAnonymousToken(),
  },
});

socket.on('connect', () => {
  logger.info(`Socket connected with id: ${socket.id}`);
  setTimeout(() => {
    logger.info('Sending ping.');
    socket.emit('ping');
    socket.emit('currentPlayers');
  }, 500);



  setTimeout(() => {
    // request
    const messageData: IMessageEventData = {
      text: 'hello',
      name: 'John',
      timestamp: Date.now(),
    };
    socket.emit('message', messageData);
  }, 2000);
});

socket.on('connect_error', (err: any) => {
  logger.error(err.message);
});

socket.on('hello', () => {
  logger.info('Received hello message from backend.');
});

socket.on('pong', () => {
  logger.info('Received pong from backend.');
});

socket.on('playerConnected', (data: any) => {
  logger.info('Player connected', data);
});

socket.on('playerDisconnected', (data: any) => {
  logger.info('Player disconnected', data);
});

socket.on('currentPlayers', (data: any) => {
  logger.info('currentPlayers', data);
});

socket.on('matchSuccess', (data: any) => {
  logger.info('matchSuccess', data);
  setTimeout(() => {
    socket.emit('playerReady');
  }, 1000);
});

var interval_set = false;

socket.on('gameStatus', (data: IGameStatusData) => {
  logger.info('gameStatus', data);

  if (data.status === GameStatus.InProgress && !interval_set) {
    interval_set = true;
    setInterval(() => {
      const data: IGameUpdateData = {
        pos: {
          lat: 10,
          lng: 20,
        },
      };
      socket.emit('gameUpdate', data);
    }, _.random(500, 2000));
  }
});

socket.on('initialPosition', (data: any) => {
  logger.info('initialPosition', data);
});

// messages
socket.on('message', (data: IMessageEventData) => {
  logger.info('message', data);
});
