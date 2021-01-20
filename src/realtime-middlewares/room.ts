import { Socket } from 'socket.io';
import winston from 'winston';
import { addToMatchmaking } from './matchmaking';

require('../logger');
const logger = winston.loggers.get('server');

interface ISocketQuery {
  roomName: string;
}

export interface IGameSocket extends Socket {
  gameID?: string
}

export const connectToRoom = (socket: Socket, next: any) => {
  const gameSocket = <IGameSocket> socket;
  gameSocket.gameID = undefined;

  if (!('roomName' in gameSocket.handshake.query)) {
    // if room isn't specified, enter matchmaking
    logger.info('No room name specified, starting matchmaking.');
    addToMatchmaking(gameSocket);
  } else {
    const roomName = (<ISocketQuery>gameSocket.handshake.query).roomName;
    logger.info('Joining room', { roomName })
    gameSocket.join(roomName);
    gameSocket.gameID = roomName;
  };
  next();
};
