import winston from 'winston';
import { IGameSocket } from '../realtime-middlewares/games';
import { notInGameHandler } from '../realtime-middlewares/gameHandlerError'
import { Socket } from 'socket.io';
import { io } from '../app';

require('../logger');
const logger = winston.loggers.get('server');

// message data object definition
interface IMessageEventData {
  text: string
  name: string
  timestamp: number // milliseconds since Unix epoch
}

/**
 * Registers handler for a `message` event
 *
 * @param socket A connected Socket.IO socket connection to register
 * the handler to
 */
export const registerMessageHandler = (socket: Socket) => {
  const gameSocket = <IGameSocket>socket;
  socket.on('message', (message: IMessageEventData) => {
    if (!gameSocket.gameID) return notInGameHandler(gameSocket);
    logger.info('Message sent:', { socket: socket.id, message })
    io.to(gameSocket.gameID).emit('message', message);
  });
};
