import { Socket } from 'socket.io';
import { io } from '../app';
import { IGameSocket } from '../realtime-middlewares/games';
import { removeFromMatchmaking } from '../realtime-middlewares/matchmaking';

/**
 * Registers handler for a `disconnect` event
 *
 * @param socket A connected Socket.IO socket connection to register
 * the handler to
 */
export const registerDisconnectHandler = (socket: Socket) => {
  const gameSocket = <IGameSocket>socket;
  socket.on('disconnect', (reason: any) => {
    removeFromMatchmaking(socket);
    // if in a game, send disconnect message to the room
    if (gameSocket.gameID) {
      io.to(gameSocket.gameID).emit('playerDisconnected', { player: gameSocket.player?.username })
    }
  });
};
