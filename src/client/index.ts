import io from 'socket.io-client';
import winston from 'winston';
import readline from 'readline';
import dotenv from 'dotenv';

require('../logger'); // setup logger
const logger = winston.loggers.get('client');

// setup env vars
dotenv.config();

// Constants
const BACKEND_URL = 'http://localhost:4200';

// Socket.io config
const socket = io(BACKEND_URL, {
  // @ts-ignore
  auth: {
    token: process.env.TEST_JWT || ""
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