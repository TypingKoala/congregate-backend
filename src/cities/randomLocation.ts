import { Position } from '../congregate-redis/Position';
import { ServerLogger } from '../logger';
import _ from 'lodash';
import boston_coords from './boston.json';
import game_settings from '../game_settings';

export interface CityCoords {
  ne_pos: Position;
  sw_pos: Position;
}

export enum Cities {
  Boston = 'Boston',
}

export const ValidCities = [Cities.Boston];

export const city_coords: Record<Cities, number[][][]> = {
  Boston: boston_coords
};

export const getRandomPositions = (city: Cities): [Position, Position] => {
  // use the same location in test mode
  if (game_settings.TEST_MODE) {
    ServerLogger.warn("Generating non-random locations with test mode.")
    return [{
      lat: 42.365573,
      lng: -71.104039
    }, {
      lat: 42.357775,
      lng: -71.092889
    }]
  }


  // get first random position
  const position_pair = _.sample(city_coords[city]);
  if (!position_pair) {
    throw Error("Unable to get position.")
  }
  const pos1: Position = {
    lat: position_pair[0][1],
    lng: position_pair[0][0]
  };


  const pos2: Position = {
    lat: position_pair[1][1],
    lng: position_pair[1][0],
  };

  // randomize ordering of pairs
  return Math.random() > 0.5? [pos1, pos2]: [pos2, pos1];
};
