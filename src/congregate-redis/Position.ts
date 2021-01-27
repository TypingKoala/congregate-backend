const haversine = require('haversine');

export interface Position {
  lat: number;
  lng: number;
}

export function getDistance(pos1: Position, pos2: Position): number {
  return haversine(pos1, pos2, {
    format: '{lat,lng}',
    unit: 'meter',
  });
}
