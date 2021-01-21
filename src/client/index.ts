import io from 'socket.io-client';
import winston from 'winston';
import readline from 'readline';
import dotenv from 'dotenv';
import { generateAnonymousToken } from '../api/getAnonymousToken';
import { setTimeout } from 'timers';

require('../logger'); // setup logger
const logger = winston.loggers.get('client');

// setup env vars
dotenv.config();

// Constants
const BACKEND_URL = 'http://j.jbui.me:4000';

// Socket.io config
const socket = io(BACKEND_URL, {
  // @ts-ignore
  auth: {
    token: generateAnonymousToken()
  }
});

socket.on('connect', () => {
  logger.info(`Socket connected with id: ${socket.id}`);
  setTimeout(() => {
    logger.info('Sending ping.');
    socket.emit('ping');
  }, 500);
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
  }, 1000)
});

socket.on('gameStatus', (data: any) => {
  logger.info('gameStatus', data);
})

function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Event name: ', (eventName) => {
    rl.question('Message: ', (message) => {
      socket.emit(eventName, message);
    });
  });
}

// main();
