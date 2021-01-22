import winston from 'winston';
import { IGameSocket } from '../realtime-middlewares/games';
import { notInGameHandler } from '../realtime-middlewares/gameHandlerError'
import { Socket } from 'socket.io';

require('../logger');
const logger = winston.loggers.get('server');

// game update data object definition
interface IGameUpdateData {
  // send current player coordinates
  pos: {
    lat: number,
    lng: number
  }
}

/**
 * Registers handler for a `gameUpdate` event
 *
 * @param socket A connected Socket.IO socket connection to register
 * the handler to
 */
export const registerGameUpdateHandler = (socket: Socket) => {
  const gameSocket = <IGameSocket>socket;
  socket.on('gameUpdate', (data: IGameUpdateData) => {
    if (!gameSocket.gameID) return notInGameHandler(gameSocket);
    logger.info('Game update received', { socket: socket.id, data })
    if (gameSocket.player) gameSocket.player.pos = data.pos;
  });
};
