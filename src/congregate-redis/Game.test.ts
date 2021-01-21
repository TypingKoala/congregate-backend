'use strict';
import game_settings from '../game_settings';
import Game from './Game';
import { GameStatus } from './GameStatus';
import Player from './Player';

var game: Game | undefined;

afterEach(() => {
  if (game) game.cleanup();
  jest.clearAllMocks();
});

describe('Game', () => {
  it('correctly stores gameID', () => {
    game = new Game('TinyWalrus');
    expect(game.gameID).toEqual('TinyWalrus');
  });

  it('starts countdown once two players are added and ready', () => {
    game = new Game('TinyWalrus');

    // add players
    const player1 = new Player('p1', 'p1@example.com');
    const player2 = new Player('p2', 'p2@example.com');
    game.addPlayer(player1);
    game.addPlayer(player2);

    // set ready state of players
    player1.ready = true;
    player2.ready = true;

    var gameStatus = game.getGameStatusData().status;
    expect(gameStatus).toBe(GameStatus.Starting);
  });

  it('resets ready state of players once countdown starts', () => {
    game = new Game('TinyWalrus');

    // add players
    const player1 = new Player('p1', 'p1@example.com');
    const player2 = new Player('p2', 'p2@example.com');
    game.addPlayer(player1);
    game.addPlayer(player2);

    // set ready state of players
    player1.ready = true;
    player2.ready = true;

    var gameStatus = game.getGameStatusData().status;
    expect(gameStatus).toBe(GameStatus.Starting);
    game.getPlayers().forEach((player) => {
      expect(player.ready).toBe(false);
    });
  });

  it('starts game after countdown timer', () => {
    var currentTime = Date.now();
    jest.spyOn(global.Date, 'now').mockImplementation(() => currentTime);
    game = new Game('TinyWalrus');

    // add players
    const player1 = new Player('p1', 'p1@example.com');
    const player2 = new Player('p2', 'p2@example.com');
    game.addPlayer(player1);
    game.addPlayer(player2);

    // set ready state of players
    player1.ready = true;
    player2.ready = true;

    // advance timer
    currentTime += game_settings.ROUND_START_COUNTDOWN * 1000
    game.tick();
    var gameStatus = game.getGameStatusData().status;
    expect(gameStatus).toBe(GameStatus.InProgress);
  });

  it('sets player positions after starting game', () => {
    var currentTime = Date.now();
    jest.spyOn(global.Date, 'now').mockImplementation(() => currentTime);
    game = new Game('TinyWalrus');

    // add players
    const player1 = new Player('p1', 'p1@example.com');
    const player2 = new Player('p2', 'p2@example.com');
    game.addPlayer(player1);
    game.addPlayer(player2);

    // set ready state of players
    player1.ready = true;
    player2.ready = true;

    expect(player1.pos).toBeUndefined();
    expect(player2.pos).toBeUndefined();

    // advance timer
    currentTime += game_settings.ROUND_START_COUNTDOWN * 1000;
    game.tick();
    var gameStatus = game.getGameStatusData().status;
    expect(gameStatus).toBe(GameStatus.InProgress);
    expect(player1.pos).toBeDefined();
    expect(player2.pos).toBeDefined();
  });

  it('calls onPositionSet() once position is set', () => {
    var currentTime = Date.now();
    jest.spyOn(global.Date, 'now').mockImplementation(() => currentTime);

    const onUpdateMock = jest.fn();
    const onPositionSetMock = jest.fn();
    game = new Game('TinyWalrus', onUpdateMock, onPositionSetMock);

    // add players
    const player1 = new Player('p1', 'p1@example.com');
    const player2 = new Player('p2', 'p2@example.com');
    game.addPlayer(player1);
    game.addPlayer(player2);

    // set ready state of players
    player1.ready = true;
    player2.ready = true;

    // advance timer
    expect(player1.pos).toBeUndefined();
    expect(player2.pos).toBeUndefined();
    expect(onPositionSetMock.mock.calls.length).toBe(0);

    currentTime += game_settings.ROUND_START_COUNTDOWN * 1000;
    game.tick();
    expect(player1.pos).toBeDefined();
    expect(player2.pos).toBeDefined();
    expect(onPositionSetMock.mock.calls.length).toBe(2);
  });

  it('returns the players with getPlayer()', () => {
    game = new Game('TinyWalrus');

    // add players
    const player1 = new Player('p1', 'p1@example.com');
    const player2 = new Player('p2', 'p2@example.com');
    game.addPlayer(player1);
    game.addPlayer(player2);

    expect(game.getPlayers()).toEqual([player1, player2])
  });

  it('results in a loss if time expires', () => {
    var currentTime = Date.now();
    jest.spyOn(global.Date, 'now').mockImplementation(() => currentTime);

    game = new Game('TinyWalrus');

    // add players
    const player1 = new Player('p1', 'p1@example.com');
    const player2 = new Player('p2', 'p2@example.com');
    game.addPlayer(player1);
    game.addPlayer(player2);

    // set ready state of players
    player1.ready = true;
    player2.ready = true;

    // advance timer to in progress
    currentTime += game_settings.ROUND_START_COUNTDOWN * 1000;
    game.tick();
    // advance timer to loss
    currentTime += game_settings.ROUND_TIMER * 1000;
    game.tick();
    var gameStatus = game.getGameStatusData().status;
    expect(gameStatus).toBe(GameStatus.Loss);
  });

  it('returns to lobby after loss', () => {
    var currentTime = Date.now();
    jest.spyOn(global.Date, 'now').mockImplementation(() => currentTime);

    game = new Game('TinyWalrus');

    // add players
    const player1 = new Player('p1', 'p1@example.com');
    const player2 = new Player('p2', 'p2@example.com');
    game.addPlayer(player1);
    game.addPlayer(player2);

    // set ready state of players
    player1.ready = true;
    player2.ready = true;

    // advance timer to in progress
    currentTime += game_settings.ROUND_START_COUNTDOWN * 1000;
    game.tick();
    // advance timer to loss
    currentTime += game_settings.ROUND_TIMER * 1000;
    game.tick();
    // advance to next tick
    currentTime += 1000;
    game.tick();
    var gameStatus = game.getGameStatusData().status;
    expect(gameStatus).toBe(GameStatus.InLobby);
  });

  it('results in a win if both players are close enough', () => {
    var currentTime = Date.now();
    jest.spyOn(global.Date, 'now').mockImplementation(() => currentTime);

    game = new Game('TinyWalrus');

    // add players
    const player1 = new Player('p1', 'p1@example.com');
    const player2 = new Player('p2', 'p2@example.com');
    game.addPlayer(player1);
    game.addPlayer(player2);

    // set ready state of players
    player1.ready = true;
    player2.ready = true;

    // advance timer to in progress
    currentTime += game_settings.ROUND_START_COUNTDOWN * 1000;
    game.tick();
    var gameStatus = game.getGameStatusData().status;
    expect(gameStatus).toBe(GameStatus.InProgress);

    // players basically next to each other
    player1.pos = {
      lat: 42.35900,
      lng: -71.093804
    }
    player2.pos = {
      lat: 42.35900,
      lng: -71.093804
    }

    var gameStatus = game.getGameStatusData().status;
    expect(gameStatus).toBe(GameStatus.Win);
  });

  it('results in a win if both players are ~45m away', () => {
    var currentTime = Date.now();
    jest.spyOn(global.Date, 'now').mockImplementation(() => currentTime);

    game = new Game('TinyWalrus');

    // add players
    const player1 = new Player('p1', 'p1@example.com');
    const player2 = new Player('p2', 'p2@example.com');
    game.addPlayer(player1);
    game.addPlayer(player2);

    // set ready state of players
    player1.ready = true;
    player2.ready = true;

    // advance timer to in progress
    currentTime += game_settings.ROUND_START_COUNTDOWN * 1000;
    game.tick();
    var gameStatus = game.getGameStatusData().status;
    expect(gameStatus).toBe(GameStatus.InProgress);

    // players 45m away from each other
    player1.pos = {
      lat: 42.357977,
      lng: -71.098399
    }
    player2.pos = {
      lat: 42.358147,
      lng: -71.097893
    }

    var gameStatus = game.getGameStatusData().status;
    expect(gameStatus).toBe(GameStatus.Win);
  });

  it('remains in progress if both players are ~55m away', () => {
    var currentTime = Date.now();
    jest.spyOn(global.Date, 'now').mockImplementation(() => currentTime);

    game = new Game('TinyWalrus');

    // add players
    const player1 = new Player('p1', 'p1@example.com');
    const player2 = new Player('p2', 'p2@example.com');
    game.addPlayer(player1);
    game.addPlayer(player2);

    // set ready state of players
    player1.ready = true;
    player2.ready = true;

    // advance timer to in progress
    currentTime += game_settings.ROUND_START_COUNTDOWN * 1000;
    game.tick();
    var gameStatus = game.getGameStatusData().status;
    expect(gameStatus).toBe(GameStatus.InProgress);

    // players 55m away from each other
    player1.pos = {
      lat: 42.357977,
      lng: -71.098399
    }
    player2.pos = {
      lat: 42.358183,
      lng: -71.097789
    }

    var gameStatus = game.getGameStatusData().status;
    expect(gameStatus).toBe(GameStatus.InProgress);
  });
});
