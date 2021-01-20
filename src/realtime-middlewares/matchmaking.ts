import winston from 'winston';
import { Socket } from 'socket.io';
import { getRandomGameID } from '../api/generateGameID';
import { IGameSocket } from './room';

require('../logger');
const logger = winston.loggers.get('server');

interface IMatchSuccessData {
  gameID: string;
}

const matchmakingSockets: IGameSocket[] = [];

export const addToMatchmaking = (socket: IGameSocket) => {
  // add socket to matchmaking
  matchmakingSockets.push(socket);
  // check if there is at least one pair that can be matched
  while (matchmakingSockets.length >= 2) {
    const socket1 = matchmakingSockets.shift();
    const socket2 = matchmakingSockets.shift();

    if (socket1 && socket2) {
      // generate room name and connect them to the room
      const gameID = getRandomGameID();
      socket1.join(gameID);
      socket2.join(gameID);
      socket1;

      logger.info('Matchmaking successful', {
        socket1: socket1?.id,
        socket2: socket2?.id,
        gameID,
      });

      // emit to each socket info about the new room
      const matchSuccessData: IMatchSuccessData = { gameID };
      socket1?.emit('matchSuccess', matchSuccessData);
      socket2?.emit('matchSuccess', matchSuccessData);
    } else {
      logger.error('socket1 and socket2 were not defined in matchmaking')
    }
  }
};
