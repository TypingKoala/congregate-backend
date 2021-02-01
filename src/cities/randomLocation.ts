import { FeatureCollection, Polygon, Properties } from "@turf/helpers"

import { Position } from '../congregate-redis/Position';
import _ from 'lodash';
import game_settings from '../game_settings';
import polygonize from '@turf/polygonize';
import randomLocation from 'random-location';

const randomPointsOnPolygon = require('random-points-on-polygon');

export interface CityCoords {
  ne_pos: Position;
  sw_pos: Position;
}

export enum Cities {
  Boston = 'Boston',
}

export const city_coords: Record<Cities, FeatureCollection<Polygon, Properties>> = {
  Boston: require('./boston.json')
};

export const getRandomPositions = (city: Cities): [Position, Position] => {
  // get first random position
  const polygon = city_coords[city];
  const randomPoint = randomPointsOnPolygon(1, polygon)[0];
  const pos1: Position = {
    lat: randomPoint.geometry.coordinates[1],
    lng: randomPoint.geometry.coordinates[0],
  };

  const distance = _.random(
    game_settings.INIITAL_DISTANCE_LOWER,
    game_settings.INITIAL_DISTANCE_UPPER
  );

  const newPoint = randomLocation.randomCircumferencePoint(
    {
      latitude: pos1.lat,
      longitude: pos1.lng,
    },
    distance
  );

  const pos2: Position = {
    lat: newPoint.latitude,
    lng: newPoint.longitude,
  };

  return [pos1, pos2];
};
