import { Socket } from 'socket.io';

/**
 * Registers handler for a `ping` event, responding to the client with a `pong`
 *
 * @param socket A connected Socket.IO socket connection to register
 * the handler to
 */
export const registerPingHandler = (socket: Socket) => {
  socket.on('ping', (data: any) => {
    socket.emit('pong');
  });
};
