import winston from 'winston';
import { IGameSocket } from '../realtime-middlewares/games';
import { notInGameHandler } from '../realtime-middlewares/gameHandlerError';
import { Socket } from 'socket.io';
import { io } from '../app';

require('../logger');
const logger = winston.loggers.get('server');

/**
 * Registers handler for a `currentPlayers` event
 *
 * @param socket A connected Socket.IO socket connection to register
 * the handler to
 */
export const registerCurrentPlayersHandler = (socket: Socket) => {
  const gameSocket = <IGameSocket>socket;
  socket.on('currentPlayers', () => {
    if (!gameSocket.gameID) return notInGameHandler(gameSocket);
    const players = gameSocket.game
      ?.getPlayers()
      .filter((player) => player.socket?.connected) // only connected players
      .map((player) => player.username); // map to usernames
    socket.emit('currentPlayers', { players });
  });
};
