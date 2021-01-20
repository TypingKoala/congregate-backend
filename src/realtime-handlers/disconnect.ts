import { Socket } from 'socket.io';
import { removeFromMatchmaking } from '../realtime-middlewares/matchmaking';

/**
 * Registers handler for a `disconnect` event
 *
 * @param socket A connected Socket.IO socket connection to register
 * the handler to
 */
export const registerDisconnectHandler = (socket: Socket) => {
  socket.on('disconnect', (reason: any) => {
    removeFromMatchmaking(socket);
  });
};
