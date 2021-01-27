import { Socket } from 'socket.io';
import { registerDisconnectHandler } from './disconnect';
import { registerGameUpdateHandler } from './gameUpdate';
import { registerMessageHandler } from './message';
import { registerPingHandler } from './ping';
import { registerPlayerReadyHandler } from './playerReady';
import { registerRequestGameStatusHandler } from './requestGameStatus';

/**
 * Registers the event handlers for an incoming client Socket.IO connection
 *
 * @param socket A connected Socket.IO socket connection to register
 * handlers for
 */
export const registerRealtimeHandlers = (socket: Socket) => {
  registerPingHandler(socket);
  registerDisconnectHandler(socket);
  registerPlayerReadyHandler(socket);
  registerMessageHandler(socket);
  registerGameUpdateHandler(socket);
  registerRequestGameStatusHandler(socket);
};
