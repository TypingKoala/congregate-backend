import { Socket } from 'socket.io';
import winston from 'winston';
import Game from '../congregate-redis/Game';
import { ISocketAuthenticated } from './authenticate';
import { addToMatchmaking } from './matchmaking';
import { io } from '../app';
import Player from '../congregate-redis/Player';

require('../logger');
const logger = winston.loggers.get('server');

const activeGames = new Set();
const games: Record<string, Game> = {};

interface ISocketQuery {
  gameID: string;
}

export interface IGameSocket extends ISocketAuthenticated {
  gameID?: string
  game?: Game
  player?: Player
}

export const joinRoom = (socket: IGameSocket, gameID: string) => {
  logger.info('Joining room', { socket: socket.id, gameID });
  socket.join(gameID);
  socket.gameID = gameID;

  if (!activeGames.has(gameID)) {
    logger.info('Adding game', { gameID })
    activeGames.add(gameID);
    games[gameID] = new Game(gameID, (game) => {
      io.to(gameID).emit('gameStatus', game.getGameStatusData());
    }, (player) => {
      player.socket?.emit('initialPosition', { pos: player.pos })
    })
  }
  const player = new Player(socket.user.name, socket.user.sub, socket);
  games[gameID].addPlayer(player);
  socket.game = games[gameID];
  socket.player = player;
};

export const matchAndJoin = (socket: Socket, next: any) => {
  const gameSocket = <IGameSocket>socket;
  gameSocket.gameID = undefined;

  if (!('gameID' in gameSocket.handshake.query)) {
    // if room isn't specified, enter matchmaking
    logger.info('No room name specified, starting matchmaking.', {
      socket: socket.id,
    });
    addToMatchmaking(gameSocket);
  } else {
    const gameID = (<ISocketQuery>gameSocket.handshake.query).gameID;
    logger.info('Joining room', {
      socket: socket.id,
      gameID
    });
    joinRoom(gameSocket, gameID);
  }
  next();
};
