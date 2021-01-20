'use strict';
import assert from 'assert';

import { GameStatus, IGameStatusData } from './GameStatus';
import game_settings from '../game_settings';
import Player from './Player';

// Setup logging
import winston from 'winston';
import { getDistance } from './Position';
import { Cities, getRandomPositions } from './Cities';
require('../logger');
const logger = winston.loggers.get('server');

/**
 * Log an event only if the debug messages are enabled in game settings.
 *
 * @param message the message to log
 */
function DEBUG_LOG(message: string, metadata?: any) {
  if (game_settings.DEBUG_MESSAGES) {
    logger.log('debug', message, metadata);
  }
}

/**
 * This class manages the state for a game, automatically updating every second.
 */
export default class Game {
  readonly gameID: string;
  private status: GameStatus;
  private timeRemaining: number;
  private score: number;
  private readonly players: Player[];
  private intervalID?: number;
  private onUpdate?: (game: Game) => void;
  private onPositionSet?: () => void;

  /**
   *
   * @param gameID a unique gameID for the game being played
   * @param onUpdate a function to call on each update of the game state
   * @param onPositionSet a function that is called when the player positions are initially set
   */
  constructor(gameID: string, onUpdate?: (game: Game) => void, onPositionSet?: () => void) {
    this.gameID = gameID;
    this.status = GameStatus.InLobby;
    this.timeRemaining = 0;
    this.score = 0;
    this.onUpdate = onUpdate;
    this.onPositionSet = onPositionSet;
    this.players = [];

    // register the game ticker
    this.intervalID = undefined;
    this.registerTicker();
  }

  // PRIVATE METHODS
  private registerTicker() {
    assert(this.intervalID === undefined, 'double ticker registration');

    this.intervalID = window.setInterval(this.tick.bind(this), 1000);
  }

  private unregisterTicker() {
    assert(
      this.intervalID !== undefined,
      "can't unregister a non-existant ticker"
    );

    window.clearInterval(this.intervalID);
  }

  /**
   * This function should be called every second to update the game state
   */
  private tick() {
    switch (this.status) {
      case GameStatus.InLobby:
        // check if two players are ready
        if (
          this.players.length === 2 &&
          this.players.every((player) => player.ready)
        ) {
          // start countdown
          DEBUG_LOG('Starting countdown', { gameID: this.gameID });
          this.timeRemaining = game_settings.ROUND_START_COUNTDOWN;
          this.status = GameStatus.Starting;
          // set all players to not ready
          this.players.forEach(player => player.ready = false);
        }
        break;

      case GameStatus.Starting:
        if (this.timeRemaining <= 0) {
          // start game
          DEBUG_LOG('Starting game', { gameID: this.gameID });
          this.timeRemaining = game_settings.ROUND_TIMER;
          this.status = GameStatus.InProgress;
          // set initial positions of players
          const positions = getRandomPositions(Cities.Boston);
          this.players[0].updatePos(positions[0]);
          this.players[1].updatePos(positions[1]);
          // alert onPositionSet
          if (this.onPositionSet) this.onPositionSet();
        }
        break;

      case GameStatus.InProgress:
        if (this.timeRemaining <= 0) {
          // loss condition due to running out of time
          DEBUG_LOG('Game loss after running out of time', {
            gameID: this.gameID,
          });
          this.status = GameStatus.Loss;
        } else {
          assert(
            this.players.length === 2,
            'need two players for game in progress'
          );
          // check if all player positions are defined
          const player1Pos = this.players[0].getPos();
          const player2Pos = this.players[1].getPos();
          if (player1Pos && player2Pos) {
            // check if win condition is met
            const distance = getDistance(player1Pos, player2Pos);
            if (distance < game_settings.DISTANCE_THRESHOLD) {
              DEBUG_LOG('Game victory', {
                gameID: this.gameID,
                distance,
              });
              this.status = GameStatus.Win;
              // calculate score
              this.score += this.timeRemaining;
            }
          }
        }
        break;

      case GameStatus.Win:
        this.status = GameStatus.InLobby;
        break;

      case GameStatus.Loss:
        this.status = GameStatus.InLobby;
        break;
    }

    // update time
    this.timeRemaining--;

    // call registered function if game state is updated
    if (this.onUpdate) {
      this.onUpdate(this);
    }
  }

  // PUBLIC METHODS

  /**
   * Returns the GameStatusData object, useful for sending through Socket.io
   */
  getGameStatusData(): IGameStatusData {
    const gameStatus = {
      status: this.status,
      timeRemaining: this.timeRemaining,
      score: this.score,
      players: this.players.map((player) => player.getPlayerData())
    };
    return gameStatus;
  }

  /**
   * Add a player to the game
   * @param player the Player object to add
   */
  addPlayer(player: Player) {
    assert(this.players.length < 2, 'cannot add more than 2 players');
    this.players.push(player);
  }

  /**
   * Gets the list of players. If a player reconnects, using the existing player
   * object would continue the game.
   */
  getPlayers() {
    return this.players;
  }

  /**
   * Cleans up the object by stopping any existing interval timers.
   * 
   * This should be called when all players have disconnected from a game
   */
  cleanup() {
    this.unregisterTicker();
  }
}
