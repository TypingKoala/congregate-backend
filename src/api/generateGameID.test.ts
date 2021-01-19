import request from 'supertest';

import { getRandomGameID } from './generateGameID';
import app from '../app';

describe('getRandomGameID()', () => {
  it('returns a string', () => {
    var result = getRandomGameID();
    expect(typeof result).toBe('string');
  });
});

describe('GET /api/getUniqueGameID', () => {
  it('responds with json', (done) => {
    request(app)
      .get('/api/getUniqueGameID')
      .expect('Content-Type', /json/)
      .expect(200, done);
  })
})