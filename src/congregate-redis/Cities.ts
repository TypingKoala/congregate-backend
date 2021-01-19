import randomLocation from 'random-location';
import _ from 'lodash';
import { Position } from './Position';
import game_settings from '../game_settings';

export interface CityCoords {
  ne_pos: Position;
  sw_pos: Position;
}

export enum Cities {
  Boston = "Boston"
};

export const city_coords: Record<Cities, CityCoords> = {
  Boston: {
    ne_pos: {
      lat: 42.367918,
      lng: -71.0523,
    },
    sw_pos: {
      lat: 42.332839,
      lng: -71.099496,
    },
  },
};

export const getRandomPositions = (city: Cities): [Position, Position] => {
  // get first random position
  const bounding_box = city_coords[city];
  const pos1: Position = {
    lat: _.random(bounding_box.sw_pos.lat, bounding_box.ne_pos.lat),
    lng: _.random(bounding_box.sw_pos.lng, bounding_box.ne_pos.lng),
  }

  const distance = _.random(game_settings.INIITAL_DISTANCE_LOWER, game_settings.INITIAL_DISTANCE_UPPER);

  const newPoint = randomLocation.randomCircumferencePoint({
    latitude: pos1.lat,
    longitude: pos1.lng
  }, distance);

  const pos2: Position = {
    lat: newPoint.latitude,
    lng: newPoint.longitude
  };

  return [pos1, pos2]
};
