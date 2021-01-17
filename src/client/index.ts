import io from 'socket.io-client';
import { logger } from './logger';
import readline from 'readline';

// Constants
const BACKEND_URL = 'http://localhost:4200';

// Socket.io config
const socket = io.connect(BACKEND_URL);

socket.on('connect', () => {
  logger.info(`Socket connected with id: ${socket.id}`);
  setTimeout(() => {
    logger.info('Sending ping.');
    socket.emit('ping');
  }, 500);
});

socket.on('connect_error', () => {
  logger.error('Connection Error');
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
