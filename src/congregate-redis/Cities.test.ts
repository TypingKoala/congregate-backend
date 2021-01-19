import game_settings from '../game_settings';
import { Cities, getRandomPositions } from './Cities';
import { getDistance } from './Position';

describe('getRandomPositions()', () => {
  it('generates two random positions', () => {
    const positions = getRandomPositions(Cities.Boston);
    const distance = getDistance(positions[0], positions[1]);

    expect(game_settings.INIITAL_DISTANCE_LOWER <= distance).toBe(true);
    expect(distance <= game_settings.INITIAL_DISTANCE_UPPER).toBe(true);
  });
});
