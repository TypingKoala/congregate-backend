import winston from 'winston';
import { IGameSocket } from '../realtime-middlewares/games';
import { notInGameHandler } from '../realtime-middlewares/gameHandlerError'
import { Socket } from 'socket.io';

require('../logger');
const logger = winston.loggers.get('server');

/**
 * Registers handler for a `playerReady` event
 *
 * @param socket A connected Socket.IO socket connection to register
 * the handler to
 */
export const registerPlayerReadyHandler = (socket: Socket) => {
  const gameSocket = <IGameSocket>socket;
  socket.on('playerReady', () => {
    if (!gameSocket.gameID) return notInGameHandler(gameSocket);
    logger.info('Player ready', { socket: socket.id })
    if (gameSocket.player) gameSocket.player.ready = true;
  });
};
