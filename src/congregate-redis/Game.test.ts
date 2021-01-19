'use strict';
import game_settings from '../game_settings';
import Game from './Game';
import { GameStatus } from './GameStatus';
import Player from './Player';

jest.useFakeTimers();

afterEach(() => {
  jest.clearAllMocks();
});

describe('Game', () => {
  it('correctly stores gameID', () => {
    const newGame = new Game('TinyWalrus');
    expect(newGame.gameID).toEqual('TinyWalrus');
  });

  it('calls setInterval on init', () => {
    new Game('TinyWalrus');
    expect(setInterval).toHaveBeenCalledTimes(1);
  });

  it('decrements the timeRemaining every second', () => {
    const newGame = new Game('TinyWalrus');
    jest.advanceTimersByTime(5000);
    const timeRemaining = newGame.getGameStatusData().timeRemaining;
    expect(timeRemaining).toBe(-5);
  });

  it('calls onUpdate on each tick', () => {
    const onUpdateMock = jest.fn();
    const newGame = new Game('TinyWalrus', onUpdateMock);
    jest.advanceTimersByTime(5000);
    expect(onUpdateMock.mock.calls.length).toBe(5);
  });

  it('passes the game object when calling onUpdate', () => {
    const onUpdateMock = jest.fn((game: Game) => game.getGameStatusData());
    const newGame = new Game('TinyWalrus', onUpdateMock);
    jest.advanceTimersByTime(5000);
    const timeRemainingArr = onUpdateMock.mock.results.map(result => {
      return result.value.timeRemaining;
    })
    expect(timeRemainingArr).toEqual([-1, -2, -3, -4, -5]);
  });

  it('stops decrementing when calling cleanup()', () => {
    const newGame = new Game('TinyWalrus');
    jest.advanceTimersByTime(5000);

    var timeRemaining = newGame.getGameStatusData().timeRemaining;
    expect(timeRemaining).toBe(-5);

    newGame.cleanup();
    jest.advanceTimersByTime(5000);

    timeRemaining = newGame.getGameStatusData().timeRemaining;
    expect(timeRemaining).toBe(-5);
  });

  it('starts countdown once two players are added and ready', () => {
    const newGame = new Game('TinyWalrus');

    // add players
    const player1 = new Player('p1', 'p1@example.com');
    const player2 = new Player('p2', 'p2@example.com');
    newGame.addPlayer(player1);
    newGame.addPlayer(player2);

    // set ready state of players
    player1.ready = true;
    player2.ready = true;

    // advance timer
    jest.advanceTimersByTime(1000);
    var gameStatus = newGame.getGameStatusData().status;
    expect(gameStatus).toBe(GameStatus.Starting);
  });

  it('resets ready state of players once countdown starts', () => {
    const newGame = new Game('TinyWalrus');

    // add players
    const player1 = new Player('p1', 'p1@example.com');
    const player2 = new Player('p2', 'p2@example.com');
    newGame.addPlayer(player1);
    newGame.addPlayer(player2);

    // set ready state of players
    player1.ready = true;
    player2.ready = true;

    // advance timer
    jest.advanceTimersByTime(1000);
    var gameStatus = newGame.getGameStatusData().status;
    expect(gameStatus).toBe(GameStatus.Starting);
    newGame.getPlayers().forEach((player) => {
      expect(player.ready).toBe(false);
    });
  });

  it('starts game after countdown timer', () => {
    const newGame = new Game('TinyWalrus');

    // add players
    const player1 = new Player('p1', 'p1@example.com');
    const player2 = new Player('p2', 'p2@example.com');
    newGame.addPlayer(player1);
    newGame.addPlayer(player2);

    // set ready state of players
    player1.ready = true;
    player2.ready = true;

    // advance timer
    jest.advanceTimersByTime(1000 + game_settings.ROUND_START_COUNTDOWN * 1000);
    var gameStatus = newGame.getGameStatusData().status;
    expect(gameStatus).toBe(GameStatus.InProgress);
  });

  it('sets player positions after starting game', () => {
    const newGame = new Game('TinyWalrus');

    // add players
    const player1 = new Player('p1', 'p1@example.com');
    const player2 = new Player('p2', 'p2@example.com');
    newGame.addPlayer(player1);
    newGame.addPlayer(player2);

    // set ready state of players
    player1.ready = true;
    player2.ready = true;

    // advance timer
    expect(player1.getPos()).toBeUndefined();
    expect(player2.getPos()).toBeUndefined();
    
    jest.advanceTimersByTime(1000 + game_settings.ROUND_START_COUNTDOWN * 1000);
    expect(player1.getPos()).toBeDefined();
    expect(player2.getPos()).toBeDefined();
  });

  it('calls onPositionSet() once position is set', () => {
    const onUpdateMock = jest.fn();
    const onPositionSetMock = jest.fn();
    const newGame = new Game('TinyWalrus', onUpdateMock, onPositionSetMock);

    // add players
    const player1 = new Player('p1', 'p1@example.com');
    const player2 = new Player('p2', 'p2@example.com');
    newGame.addPlayer(player1);
    newGame.addPlayer(player2);

    // set ready state of players
    player1.ready = true;
    player2.ready = true;

    // advance timer
    expect(player1.getPos()).toBeUndefined();
    expect(player2.getPos()).toBeUndefined();
    expect(onPositionSetMock.mock.calls.length).toBe(0);
    
    jest.advanceTimersByTime(1000 + game_settings.ROUND_START_COUNTDOWN * 1000);
    expect(player1.getPos()).toBeDefined();
    expect(player2.getPos()).toBeDefined();
    expect(onPositionSetMock.mock.calls.length).toBe(1);
  });

  it('returns the players with getPlayer()', () => {
    const newGame = new Game('TinyWalrus');

    // add players
    const player1 = new Player('p1', 'p1@example.com');
    const player2 = new Player('p2', 'p2@example.com');
    newGame.addPlayer(player1);
    newGame.addPlayer(player2);

    expect(newGame.getPlayers()).toEqual([player1, player2])
  });

  it('results in a loss if time expires', () => {
    const newGame = new Game('TinyWalrus');

    // add players
    const player1 = new Player('p1', 'p1@example.com');
    const player2 = new Player('p2', 'p2@example.com');
    newGame.addPlayer(player1);
    newGame.addPlayer(player2);

    // set ready state of players
    player1.ready = true;
    player2.ready = true;

    // advance timer to in progress
    jest.advanceTimersByTime(1000 + game_settings.ROUND_START_COUNTDOWN * 1000);
    // advance timer to loss
    jest.advanceTimersByTime(game_settings.ROUND_TIMER * 1000);
    var gameStatus = newGame.getGameStatusData().status;
    expect(gameStatus).toBe(GameStatus.Loss);
  });

  it('returns to lobby after loss', () => {
    const newGame = new Game('TinyWalrus');

    // add players
    const player1 = new Player('p1', 'p1@example.com');
    const player2 = new Player('p2', 'p2@example.com');
    newGame.addPlayer(player1);
    newGame.addPlayer(player2);

    // set ready state of players
    player1.ready = true;
    player2.ready = true;

    // advance timer to in progress
    jest.advanceTimersByTime(1000 + game_settings.ROUND_START_COUNTDOWN * 1000);
    // advance timer to loss
    jest.advanceTimersByTime(game_settings.ROUND_TIMER * 1000);
    // advance to next tick
    jest.advanceTimersByTime(1000);
    var gameStatus = newGame.getGameStatusData().status;
    expect(gameStatus).toBe(GameStatus.InLobby);
  });

  it('results in a win if both players are close enough', () => {
    const newGame = new Game('TinyWalrus');

    // add players
    const player1 = new Player('p1', 'p1@example.com');
    const player2 = new Player('p2', 'p2@example.com');
    newGame.addPlayer(player1);
    newGame.addPlayer(player2);

    // set ready state of players
    player1.ready = true;
    player2.ready = true;

    // advance timer to in progress
    jest.advanceTimersByTime(1000 + game_settings.ROUND_START_COUNTDOWN * 1000);

    // players basically next to each other
    player1.updatePos({
      lat: 42.35900,
      lng: -71.093804
    })
    player2.updatePos({
      lat: 42.359275,
      lng: -71.093762
    })

    // advance to next tick
    jest.advanceTimersByTime(1000);
    var gameStatus = newGame.getGameStatusData().status;
    expect(gameStatus).toBe(GameStatus.Win);
  });

  it('results in a win if both players are ~45m away', () => {
    const newGame = new Game('TinyWalrus');

    // add players
    const player1 = new Player('p1', 'p1@example.com');
    const player2 = new Player('p2', 'p2@example.com');
    newGame.addPlayer(player1);
    newGame.addPlayer(player2);

    // set ready state of players
    player1.ready = true;
    player2.ready = true;

    // advance timer to in progress
    jest.advanceTimersByTime(1000 + game_settings.ROUND_START_COUNTDOWN * 1000);

    // players 45m away from each other
    player1.updatePos({
      lat: 42.357977,
      lng: -71.098399
    })
    player2.updatePos({
      lat: 42.358147,
      lng: -71.097893
    })

    // advance to next tick
    jest.advanceTimersByTime(1000);
    var gameStatus = newGame.getGameStatusData().status;
    expect(gameStatus).toBe(GameStatus.Win);
  });

  it('remains in progress if both players are ~55m away', () => {
    const newGame = new Game('TinyWalrus');

    // add players
    const player1 = new Player('p1', 'p1@example.com');
    const player2 = new Player('p2', 'p2@example.com');
    newGame.addPlayer(player1);
    newGame.addPlayer(player2);

    // set ready state of players
    player1.ready = true;
    player2.ready = true;

    // advance timer to in progress
    jest.advanceTimersByTime(1000 + game_settings.ROUND_START_COUNTDOWN * 1000);

    // players 45m away from each other
    player1.updatePos({
      lat: 42.357977,
      lng: -71.098399
    })
    player2.updatePos({
      lat: 42.358183,
      lng: -71.097789
    })

    // advance to next tick
    jest.advanceTimersByTime(1000);
    var gameStatus = newGame.getGameStatusData().status;
    expect(gameStatus).toBe(GameStatus.InProgress);
  });
});
