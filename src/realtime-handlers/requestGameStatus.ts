import winston from 'winston';
import { IGameSocket } from '../realtime-middlewares/games';
import { notInGameHandler } from '../realtime-middlewares/gameHandlerError'
import { Socket } from 'socket.io';

require('../logger');
const logger = winston.loggers.get('server');

/**
 * Registers handler for a `requestGameStatus` event
 *
 * @param socket A connected Socket.IO socket connection to register
 * the handler to
 */
export const registerRequestGameStatusHandler = (socket: Socket) => {
  const gameSocket = <IGameSocket>socket;
  socket.on('requestGameStatus', () => {
    if (!gameSocket.gameID) return notInGameHandler(gameSocket);
    logger.info('Game status requested', { socket: socket.id })
    if (gameSocket.game) gameSocket.game.tick();
  });
};
