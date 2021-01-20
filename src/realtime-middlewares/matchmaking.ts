import winston from 'winston';
import { Socket } from 'socket.io';
import { getRandomGameID } from '../api/generateGameID';
import { IGameSocket, joinRoom } from './games';
import { match } from 'assert';
import { assert } from 'console';

require('../logger');
const logger = winston.loggers.get('server');

interface IMatchSuccessData {
  gameID: string;
}

const matchmakingSockets: IGameSocket[] = [];

export const addToMatchmaking = (socket: IGameSocket) => {
  // add socket to matchmaking
  logger.info('adding to matchmaking', {socket: socket.id })
  matchmakingSockets.push(socket);
  // check if there is at least one pair that can be matched
  while (matchmakingSockets.length >= 2) {
    logger.info(matchmakingSockets.map(socket => socket.id))
    const socket1 = matchmakingSockets.shift();
    const socket2 = matchmakingSockets.shift();

    if (socket1 && socket2) {
      // generate room name and connect them to the room
      logger.info([socket1.connected, socket2.connected]);
      const gameID = getRandomGameID();
      joinRoom(socket1, gameID);
      joinRoom(socket2, gameID);

      logger.info('Matchmaking successful', {
        socket1: socket1.id,
        socket2: socket2.id,
        gameID,
      });

      // emit to each socket info about the new room
      const matchSuccessData: IMatchSuccessData = { gameID };
      socket1.emit('matchSuccess', matchSuccessData);
      socket2.emit('matchSuccess', matchSuccessData);
    } else {
      logger.error('socket1 and socket2 were not defined in matchmaking')
    }
  }
};

export const removeFromMatchmaking = (socket: Socket) => {
  const idx = matchmakingSockets.findIndex(s => s === socket);
  if (idx !== -1) {
    logger.info("removed socket from matchmaking", { socket: socket.id })
    matchmakingSockets.splice(idx, 1);
  }
}
