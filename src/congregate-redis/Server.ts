import winston from 'winston';
import Game from './Game';

require('../logger');
const logger = winston.loggers.get('server');

class Server {
  private readonly activeGames: Set<string>;
  private readonly games: Record<string, Game>;

  constructor() {
    this.activeGames = new Set();
    this.games = {};
  }

  getGame(gameID: string) {
    if (this.activeGames.has(gameID)) {
      return this.games[gameID];
    }
  }

  getAllGames() {
    return this.activeGames;
  }

  addGame(game: Game) {
    if (this.getGame(game.gameID)) {
      logger.warn('Cannot add game with duplciate gameID');
    } else {
      logger.info('Adding game', { game: game.gameID });
      this.activeGames.add(game.gameID);
      this.games[game.gameID] = game;
    }
  }

  deleteGame(gameID: string) {
    if (!this.getGame(gameID)) {
      logger.warn('Cannot delete game that does not exist');
    } else {
      logger.info('Deleting game', { game: gameID });
      this.activeGames.delete(gameID);
      delete this.games[gameID];
    }
  }
}

export const GameServer = new Server();
