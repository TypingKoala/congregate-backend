import { Game } from './game';

describe('Game', () => {
  it("Returns correct type", () => {
    const newGame = new Game();
    expect(newGame.type).toEqual("Game");
  });
});