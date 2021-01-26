import winston from 'winston';
import Game from './Game';

require('../logger');
const logger = winston.loggers.get('server');

class Server {
  private activeGames: Set<string>;
  private games: Record<string, Game>;

  constructor() {
    this.activeGames = new Set();
    this.games = {};

    setInterval(() => {
      this.garbageCollect();
    }, 60000);
  }

  // PRIVATE METHODS
  private garbageCollect() {
    if (this.activeGames.size === 0) return;

    const newActiveGames: Set<string> = new Set();
    const newGames: Record<string, Game> = {};

    const connectedGames: string[] = [];
    const removedGames: string[] = [];
    // only add games that have at least one player connected
    this.activeGames.forEach((gameID, _gameID, _set) => {
      const players = this.games[gameID].getPlayers();
      if (players.some((player) => player.isConnected())) {
        newActiveGames.add(gameID);
        newGames[gameID] = this.games[gameID];
        connectedGames.push(gameID);
      } else {
        removedGames.push(gameID);
      }
    });

    logger.info(
      `Garbage collected ${this.activeGames.size - newActiveGames.size} games`,
      { removedGames, connectedGames }
    );

    // replace fields on server
    this.activeGames = newActiveGames;
    this.games = newGames;
  }

  // PUBLIC METHODS
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
