import { Position } from '../congregate-redis/Position';
import _ from 'lodash';

export interface CityCoords {
  ne_pos: Position;
  sw_pos: Position;
}

export enum Cities {
  Boston = 'Boston',
}

export const city_coords: Record<Cities, []> = {
  Boston: require('./boston.json')
};

export const getRandomPositions = (city: Cities): [Position, Position] => {
  // get first random position
  const position_pair = _.sample(city_coords[city]);
  if (!position_pair) {
    throw Error("Unable to get position.")
  }
  const pos1: Position = {
    lat: position_pair[0][1],
    lng: position_pair[0][0]
  };

  // use the same location in test mode
  if (process.env.TEST_MODE) {
    return [pos1, pos1]
  }

  const pos2: Position = {
    lat: position_pair[1][1],
    lng: position_pair[1][0],
  };

  // randomize ordering of pairs
  return Math.random() > 0.5? [pos1, pos2]: [pos2, pos1];
};
