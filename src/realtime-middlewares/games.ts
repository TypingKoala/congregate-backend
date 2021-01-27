import { Socket } from 'socket.io';
import winston from 'winston';
import Game from '../congregate-redis/Game';
import { ISocketAuthenticated } from './authenticate';
import { addToMatchmaking } from './matchmaking';
import { io } from '../app';
import Player from '../congregate-redis/Player';
import { GameServer } from '../congregate-redis/Server';

require('../logger');
const logger = winston.loggers.get('server');

interface ISocketQuery {
  gameID: string;
}

export interface IGameSocket extends ISocketAuthenticated {
  gameID?: string;
  game?: Game;
  player?: Player;
}

export const joinRoom = (socket: IGameSocket, gameID: string) => {
  logger.info('Joining room', { socket: socket.id, gameID });
  socket.join(gameID);
  socket.gameID = gameID;

  var game = GameServer.getGame(gameID);

  if (!game) {
    game = new Game(gameID, (game) => {
      io.to(gameID).emit('gameStatus', game.getGameStatusData());
    });
    GameServer.addGame(game);
  }

  // check if player has already joined previously
  const existingPlayer = game
    .getPlayers()
    .find((player) => player.email === socket.user.sub);
  var player: Player;

  if (existingPlayer) {
    player = existingPlayer;
  } else {
    // create new player
    player = new Player(socket.user.name, socket.user.sub);
  }
  // register onInitialPosition
  player.registerOnInitialPosition(() => {
    // specify actions when the player gets an initial position
    logger.info('Sending position', { pos: player.pos, socket: socket.id });
    socket.emit('initialPosition', { pos: player.pos });
  });
  player.registerSocket(socket);
  // register player with game
  game.addPlayer(player);
  socket.game = game;
  socket.player = player;
  game.tick();
};

export const matchPlayer = (socket: Socket, next: any) => {
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
      gameID,
    });
    joinRoom(gameSocket, gameID);
  }
  next();
};
