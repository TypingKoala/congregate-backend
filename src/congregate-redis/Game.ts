'use strict';
import assert from 'assert';
import { setTimeout, clearTimeout } from 'timers';

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
  private score: number;
  private readonly players: Player[];

  private countdownTotalTime?: number;
  private countdownStartTime?: number;
  private countdownTimeout?: NodeJS.Timeout;

  private onUpdate?: (game: Game) => void;
  private onPositionSet?: (player: Player) => void;

  /**
   *
   * @param gameID a unique gameID for the game being played
   * @param onUpdate a function to call on each update of the game state
   * @param onPositionSet a function that is called when the player positions are initially set
   */
  constructor(
    gameID: string,
    onUpdate?: (game: Game) => void,
    onPositionSet?: (player: Player) => void
  ) {
    this.gameID = gameID;
    this.status = GameStatus.InLobby;
    this.score = 0;
    this.onUpdate = onUpdate;
    this.onPositionSet = onPositionSet;
    this.players = [];
  }

  // PRIVATE METHODS
  private registerCountdown(sec: number) {
    assert(this.countdownTimeout === undefined, 'double ticker registration');
    this.countdownStartTime = Date.now();
    this.countdownTotalTime = sec * 1000;
    this.countdownTimeout = setTimeout(this.tick.bind(this), sec * 1000);
  }

  /**
   * Checks if the last registered countdown is finished. Return true if finished
   * false otherwise.
   */
  private countdownIsFinished() {
    assert(
      this.countdownStartTime,
      'cannot check if finished if start time is undefined'
    );
    assert(
      this.countdownTotalTime,
      'cannot check if finished if total time is undefined'
    );
    return Date.now() - this.countdownStartTime >= this.countdownTotalTime;
  }

  private unregisterCountdown() {
    assert(
      this.countdownTimeout !== undefined,
      "can't unregister a non-existant ticker"
    );
    clearTimeout(this.countdownTimeout);
    this.countdownTimeout = undefined;
  }

  /**
   * This function should be called every second to update the game state
   */
  tick() {
    switch (this.status) {
      case GameStatus.InLobby:
        this.cleanup();
        // check if two players are ready
        if (
          this.players.length === 2 &&
          this.players.every((player) => player.ready)
        ) {
          // start countdown
          DEBUG_LOG('Starting countdown', { gameID: this.gameID });
          this.registerCountdown(game_settings.ROUND_START_COUNTDOWN);
          this.status = GameStatus.Starting;
          // set all players to not ready
          this.players.forEach((player) => (player.ready = false));
        }
        break;

      case GameStatus.Starting:
        if (this.countdownIsFinished()) {
          this.unregisterCountdown();
          // start game
          DEBUG_LOG('Starting game', { gameID: this.gameID });
          this.registerCountdown(game_settings.ROUND_TIMER);
          this.status = GameStatus.InProgress;
          // set initial positions of players
          const positions = getRandomPositions(Cities.Boston);
          this.players[0].pos = positions[0];
          this.players[1].pos = positions[1];
          // alert onPositionSet
          if (this.onPositionSet) {
            this.onPositionSet(this.players[0]);
            this.onPositionSet(this.players[1]);
          }
        }
        break;

      case GameStatus.InProgress:
        if (this.countdownIsFinished()) {
          // loss condition due to running out of time
          DEBUG_LOG('Game loss after running out of time', {
            gameID: this.gameID,
          });
          this.unregisterCountdown();
          this.status = GameStatus.Loss;
          this.registerCountdown(1);
        } else {
          assert(
            this.players.length === 2,
            'need two players for game in progress'
          );
          // check if all player positions are defined
          const player1Pos = this.players[0].pos;
          const player2Pos = this.players[1].pos;
          if (player1Pos && player2Pos) {
            // check if win condition is met
            const distance = getDistance(player1Pos, player2Pos);
            if (distance < game_settings.DISTANCE_THRESHOLD) {
              DEBUG_LOG('Game victory', {
                gameID: this.gameID,
                distance,
              });
              this.unregisterCountdown();
              this.status = GameStatus.Win;
              this.registerCountdown(1);
              // calculate score
              this.score += Math.floor(
                (Date.now() - this.countdownStartTime!) / 1000
              );
            }
          }
        }
        break;

      case GameStatus.Win:
        if (this.countdownIsFinished()) {
          this.cleanup();
          this.status = GameStatus.InLobby;
          this.registerCountdown(1);
        }
        break;

      case GameStatus.Loss:
        if (this.countdownIsFinished()) {
          this.cleanup();
          this.status = GameStatus.InLobby;
          this.registerCountdown(1);
        }
        break;
    }

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
    var timeRemaining;
    if (this.countdownTimeout) {
      const elapsedTime = Date.now() - this.countdownStartTime!;
      timeRemaining = (this.countdownTotalTime! - elapsedTime) / 1000
    } else {
      timeRemaining = 0
    }

    const gameStatus = {
      status: this.status,
      timeRemaining,
      score: this.score,
      players: this.players.map((player) => player.getPlayerData()),
    };
    return gameStatus;
  }

  /**
   * Add a player to the game
   * @param player the Player object to add
   */
  addPlayer(player: Player) {
    assert(this.players.length < 2, 'cannot add more than 2 players');
    player.registerOnUpdate(() => {
      this.tick(); // update game state if player updates
    });
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
    if (this.countdownTimeout) {
      this.unregisterCountdown();
    }
  }
}
