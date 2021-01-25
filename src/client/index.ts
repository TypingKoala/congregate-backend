import io from 'socket.io-client';
import winston from 'winston';
import dotenv from 'dotenv';
import _ from 'lodash';
import { generateAnonymousToken } from '../api/getAnonymousToken';
import { setTimeout } from 'timers';
import { GameStatus, IGameStatusData, IGameUpdateData, IMessageEventData } from './types';

require('../logger'); // setup logger
const logger = winston.loggers.get('client');

// setup env vars
dotenv.config();

// Constants
const BACKEND_URL = 'http://j.jbui.me:5000';

// Socket.io config
const socket = io(BACKEND_URL, {
  query: {
    gameID: 'hello'
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
  }, 500);

  setTimeout(() => {
    // request
    const messageData: IMessageEventData = {
      text: 'hello',
      name: 'John',
      timestamp: Date.now()
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
          lng: 20
        }
      }
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