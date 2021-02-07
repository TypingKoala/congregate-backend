'use strict';

import { Cities, ValidCities, getRandomPositions } from '../cities/randomLocation';
import GameModel, { IGameModel } from '../models/Game';
import { GameStatus, IGameStatusData } from './GameStatus';
import User, { IUserModel } from '../models/User';
import { clearTimeout, setTimeout } from 'timers';

import Player from './Player';
import { ServerLogger } from '../logger';
import _ from 'lodash';
import assert from 'assert';
import game_settings from '../game_settings';
import { getDistance } from './Position';
// Setup logging
import winston from 'winston';

require('../logger');
const logger = winston.loggers.get('server');

/**
 * Log an event only if the debug messages are enabled in game settings.
 *
 * @param message the message to log
 */
function DEBUG_LOG(message: string, metadata?: any) {
  logger.info(message, metadata);
}

/**
 * This class manages the state for a game, automatically updating every second.
 */
export default class Game {
  readonly gameID: string;
  private status: GameStatus;
  private score: number;
  private readonly players: Player[];
  readonly city: Cities;

  private countdownTotalTime?: number;
  private countdownStartTime?: number;
  private countdownTimeout?: NodeJS.Timeout;

  private onUpdate?: (game: Game) => void;

  /**
   *
   * @param gameID a unique gameID for the game being played
   * @param city a city to play a game in
   * @param onUpdate a function to call on each update of the game state
   */
  constructor(gameID: string, city?: Cities, onUpdate?: (game: Game) => void) {
    this.gameID = gameID;
    this.status = GameStatus.InLobby;
    this.score = 0;
    this.onUpdate = onUpdate;
    this.players = [];
    this.city = (city)? city : _.sample(ValidCities)!;
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
    const EPSILON = 100; // in ms
    assert(
      this.countdownStartTime,
      'cannot check if finished if start time is undefined'
    );
    assert(
      this.countdownTotalTime,
      'cannot check if finished if total time is undefined'
    );
    return (
      Date.now() - this.countdownStartTime >= this.countdownTotalTime - EPSILON
    );
  }

  private unregisterCountdown() {
    assert(
      this.countdownTimeout !== undefined,
      "can't unregister a non-existant ticker"
    );
    clearTimeout(this.countdownTimeout);
    this.countdownTimeout = undefined;
  }

  clearPlayersReady() {
    this.players[0].ready = false;
    this.players[1].ready = false;
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
          assert(ValidCities.includes(this.city), 'invalid city')
          const positions = getRandomPositions(this.city);
          this.players[0].pos = positions[0];
          this.players[1].pos = positions[1];
          // send position to players
          this.players[0].sendPosition();
          this.players[1].sendPosition();
          DEBUG_LOG('Sending player positions', {
            players: this.players.map((player) => player.pos),
          });
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
          this.clearPlayersReady();
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
              const timeElapsed = Math.floor(
                (Date.now() - this.countdownStartTime!) / 1000
              );
              const score = game_settings.ROUND_TIMER - timeElapsed;
              DEBUG_LOG('Game victory', {
                gameID: this.gameID,
                distance,
                score,
              });
              this.unregisterCountdown();
              this.status = GameStatus.Win;
              // clear ready state
              this.clearPlayersReady();
              this.registerCountdown(1);
              // calculate score
              this.score += score;
              // update score in database
              if (process.env.NODE_ENV !== 'test') {
                DEBUG_LOG('Adding to database');
                const finishPosition = {
                  type: 'Point',
                  coordinates: [
                    this.players[0].pos?.lng,
                    this.players[0].pos?.lat,
                  ],
                };
                GameModel.updateOne(
                  { gameID: this.gameID },
                  {
                    score: this.score,
                    $push: {
                      finishPositions: finishPosition,
                    },
                  },
                  {
                    upsert: true,
                  },
                  (err: any, game: any) => {
                    if (err) ServerLogger.error(err);
                    // register game with all players
                    this.players.forEach((player) => {
                      // @ts-ignore
                      User.updateOne(
                        { email: player.email },
                        { $addToSet: { games: this.gameID } },
                        {},
                        (err: any, user: IUserModel) => {
                          if (err) ServerLogger.error(err);
                          ServerLogger.info('User updated', {
                            games: user.games,
                          });
                        }
                      );
                    });
                  }
                );
              }
            }
          }
        }
        break;

      case GameStatus.Win:
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

      case GameStatus.Loss:
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
      timeRemaining = (this.countdownTotalTime! - elapsedTime) / 1000;
    } else {
      timeRemaining = 0;
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
    // check if player already exists
    const existingPlayer = this.players.find((p) => p.email === player.email);
    if (!existingPlayer) {
      this.players.push(player); // add new player
    }

    assert(this.players.length <= 2, 'cannot have more than 2 players');
    player.registerOnUpdate(() => {
      this.tick(); // update game state if player updates
    });
    player.registerGame(this);
  }

  /**
   * Gets the list of players. If a player reconnects, using the existing player
   * object would continue the game.
   */
  getPlayers() {
    return this.players;
  }

  /**
   * Cleans up the object by stopping any existing interval timers and removing
   * from the games pool
   *
   * This should be called when all players have disconnected from a game.
   */
  cleanup() {
    if (this.countdownTimeout) {
      this.unregisterCountdown();
    }
  }
}
